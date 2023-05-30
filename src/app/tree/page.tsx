"use client";

import {
  get_calib_param, get_vehicle_model, save_calib_param, save_vehicle_model
} from '~/common/util';
import { useEffect, useState } from 'react';
import { Box, Button, Card, Checkbox, Collapse, IconButton, Paper, TextField, Typography, styled } from '@mui/material';
import VehicleModelView, { QuatanionPoseForm, DEFAULT_POSE, MyAxes, Vehicle, Ground, Sensor, BASE_LINK_TRANSFORM } from '~/components/vehicle_model_view';

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import { Disclosure } from '@headlessui/react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const default_link = {
  tgt_frame: {
    frame_id: "base_link",
    transform: {
      x: 0,
      y: 0,
      z: 0,
      roll: 0,
      pitch: 0,
      yaw: 0,
    }
  },
  parents: []
}

export default function Page() {
  const [vehicle_data, set_vehicle_data] = useState({});
  const [calib, set_calib] = useState([]);
  const [select_link, set_select_link] = useState(default_link);

  const init = async () => {
    const vechile_model = await get_vehicle_model();
    set_vehicle_data(vechile_model);
    const calib_param = await get_calib_param();
    set_calib(calib_param);
  }
  const save = async () => {
    const response = await save_calib_param(calib);
  }
  const link_update_handler = (new_form, select_link) => {
    const idx_i = select_link.idx_i;
    const idx_j = select_link.idx_j;
    if (idx_j === undefined) {
      const new_link = calib.map((ele, i) => {
        if (i === idx_i) {
          return {
            ...ele,
            transform: new_form
          }
        }
        return ele;
      })
      set_calib(new_link);
      set_select_link({
        ...select_link,
        tgt_frame: new_link.find((ele, idx) => {
          return idx === idx_i;
        }),
      });
    } else {
      const new_link = calib.map((ele, i) => {
        if (i === idx_i) {
          return {
            ...ele,
            children: ele.children.map((ele2, j) => {
              if (j === idx_j) {
                return {
                  ...ele2,
                  transform: new_form
                }
              }
              return ele2;
            })
          }
        }
        return ele;
      });
      set_calib(new_link);
      set_select_link({
        ...select_link,
        tgt_frame: new_link.find((ele, idx) => {
          return idx === idx_i;
        }).children.find((ele, idx) => {
          return idx === idx_j;
        }),
      });
    }

  }

  useEffect(() => {
    init();
  }, []);

  const select_link_handler = (row, i, j) => {
    const tgt = calib.find((ele, idx) => {
      return i === idx;
    })
    if (isFinite(j)) {
      const tgt_child = tgt.children.find((ele, idx) => {
        return j === idx;
      });
      set_select_link({
        tgt_frame: tgt_child,
        idx_i: i,
        idx_j: j,
        parents: [DEFAULT_POSE, tgt]
      });
      return;
    }
    set_select_link({
      tgt_frame: tgt,
      idx_i: i,
      idx_j: j,
      parents: [DEFAULT_POSE]
    });
  };
  const check_handler = (row, i, j) => {
    const val = j === "all" ? !row.view_all : !row.view;
    const new_calib = calib.map((e1, idx_i) => {
      if (idx_i !== i) {
        return e1;
      }
      if (j === undefined) {
        return {
          ...e1,
          view: val
        }
      }
      if (e1.children !== undefined) {
        return {
          ...e1,
          view: j === "all" ? val : e1.view,
          view_all: j === "all" ? val : e1.view,
          children: e1.children.map((e2, idx_j) => {
            if (j === "all") {
              return {
                ...e2,
                view: val,
              }
            }
            if (idx_j !== j) {
              return e2;
            }
            return {
              ...e2,
              view: val,
            }
          })
        }
      }
      return {
        ...e1,
        view: val
      };
    });
    set_calib(new_calib);
  };

  const PoseForm = ({ select_link, update_handler }) => {
    const [form, set_form] = useState(select_link.tgt_frame.transform);
    const [transform2, set_transform2] = useState(select_link.tgt_frame.transform);
    const [frame, set_frame] = useState(select_link.tgt_frame);

    const update = () => {
      const valid = Object.keys(form).every((ele) => {
        return isFinite(parseFloat(form[ele]));
      })
      if (valid) {
        const new_form = {
          x: parseFloat(form.x),
          y: parseFloat(form.y),
          z: parseFloat(form.z),
          roll: parseFloat(form.roll),
          pitch: parseFloat(form.pitch),
          yaw: parseFloat(form.yaw),
        };
        set_form(new_form)
        set_transform2(new_form);
        update_handler(new_form, select_link);
      }
    }

    useEffect(() => {
      console.log(frame)
    }, [frame]);
    return (<>
      <Box>
        <Typography variant="h6">
          frame_id :  {frame.frame_id}
        </Typography>
      </Box>
      <Box>
        <TextField size="small" label="Tree Structure" fullWidth InputProps={{
          readOnly: true,
        }}
          defaultValue={[...select_link.parents, frame].map((ele, idx) => {
            return `${ele.frame_id}`
          }).join(" > ")}
        />
      </Box>
      <Box>
        <Typography variant="h6">
          Relative Position from parent
        </Typography>
      </Box>
      <Box display={"flex"}>
        <TextField label={"x"} value={form["x"]} size="small"
          onChange={(evt) => {
            set_form({
              ...form,
              x: evt.target.value
            });
          }} />
        <TextField label={"y"} value={form["y"]} size="small"
          onChange={(evt) => {
            set_form({
              ...form,
              y: evt.target.value
            });
          }} />
        <TextField label={"z"} value={form["z"]} size="small"
          onChange={(evt) => {
            set_form({
              ...form,
              z: evt.target.value
            });
          }} />
      </Box>
      <Box display={"flex"} sx={{ mt: 1 }}>
        <TextField label={"roll"} value={form["roll"]} size="small"
          onChange={(evt) => {
            set_form({
              ...form,
              roll: evt.target.value
            });
          }} />
        <TextField label={"pitch"} value={form["pitch"]} size="small"
          onChange={(evt) => {
            set_form({
              ...form,
              pitch: evt.target.value
            });
          }} />
        <TextField label={"yaw"} value={form["yaw"]} size="small"
          onChange={(evt) => {
            set_form({
              ...form,
              yaw: evt.target.value
            });
          }} />
      </Box>

      <Box>
        <Box display={"flex"} sx={{ mt: 1 }} className="justify-end">
          <Button variant='outlined' onClick={() => { update() }}> Update </Button>
        </Box>
      </Box>

      <QuatanionPoseForm transform={transform2} parents={select_link.parents} />
    </>);
  }

  return (<>
    <div className="flex flex-row w-full h-full gap-4">
      <div className="sm:basis-1/2 w-96 h-full min-w-[400px] ">
        <Card sx={{ p: 2, mb: 2, mt: 2, ml: 2 }} className='max-h-[96%] overflow-y-auto'>
          <Card >
            <Box display={"flex"} sx={{ mt: 1 }} className="justify-end">
              <Button variant='outlined' onClick={() => { save() }}> SAVE </Button>
            </Box>
          </Card>
          <div className="bg-white">
            <div className="mx-auto max-w-7xl ">
              <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
                <dl className="mt-0 divide-y divide-gray-900/10">
                  {calib.map((row, i) => (
                    <RowFromBaseLink key={`row_${row.frame_id}`}
                      row={row} i={i}
                      select_link_handler={select_link_handler}
                      check_handler={check_handler} />
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="sm:basis-1/2 w-96 overflow-hidden">
        <Card sx={{ p: 2, mb: 2, mt: 2 }} className='max-w-[760px] max-h-[96%] overflow-y-auto'>
          <Card sx={{ p: 2, mt: 2, ml: 0 }}>
            {/* <VehicleModelView vehicle_data={vehicle_data} /> */}

            <Box sx={{ height: "400px", width: "inherit" }}>
              {Object.keys(vehicle_data).length > 0 &&
                <Canvas>
                  <MyAxes />
                  <gridHelper args={[5, 10]} />
                  <gridHelper args={[5, 10]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />
                  <gridHelper args={[5, 10]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
                  <OrbitControls />
                  <ambientLight intensity={0.1} />
                  {/* {vehicle_view && <Vehicle vehicle_data={vehicle_data} />} */}
                  <Ground vehicle_data={vehicle_data} />
                  {calib.map((ele, idx) => {
                    if (ele.children === undefined) {
                      if (ele.view) {
                        return <Sensor parents={[BASE_LINK_TRANSFORM]} child={ele.transform} frame_id={ele.frame_id} />
                      } else {
                        return (<></>)
                      }
                    }
                    return (<>
                      {ele.view && <Sensor parents={[BASE_LINK_TRANSFORM]} child={ele.transform} frame_id={ele.frame_id} />}
                      {ele.children.map((ele2) => {
                        if (ele2.view) {
                          return (<Sensor parents={[BASE_LINK_TRANSFORM, ele.transform]} child={ele2.transform} frame_id={ele2.frame_id} />);
                        } else {
                          return (<></>)
                        }
                      })}
                    </>);
                  })}
                </Canvas>
              }
            </Box>
          </Card>
          <Card sx={{ p: 2, mt: 2 }}>
            <PoseForm
              select_link={select_link}
              update_handler={link_update_handler} />
          </Card>
        </Card>
      </div>
    </div >
  </>);

}



const RowFromBaseLink = ({ row, i, select_link_handler, check_handler }) => {
  const [open, set_open] = useState(false);
  return (
    <>
      <Disclosure as="div" key={row.frame_id} className="pt-6">
        {() => (
          <>
            <dt>
              <Disclosure.Button className="flex w-full text-left text-gray-900"
                onClick={(evt) => {
                  set_open(!open);
                  evt.stopPropagation();
                }}>
                <span className="flex h-7 items-center w-[30px]">
                  <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={(evt) => { }}>
                    {open ? <KeyboardArrowUpOutlinedIcon /> : <KeyboardArrowDownOutlinedIcon />}
                  </IconButton>
                </span>
                <Checkbox checked={row.view_all} sx={{ p: 1 }}
                  onClick={(evt) => {
                    check_handler(row, i, "all");
                    evt.stopPropagation();
                  }}
                />
                <span className="text-base leading-7 pl-2">
                  <Typography>{row.frame_id}</Typography>
                </span>
              </Disclosure.Button>
            </dt>
            <Disclosure.Panel as="dd" className="mt-2 pr-12">
              <p className="text-base leading-7 text-gray-600">
                <HeaderRow />
                <RowChildrenLink row={row} i={i} j={undefined} select_link_handler={select_link_handler} check_handler={check_handler} />
                {row.children && row.children.map((ele, j) => {
                  return (<RowChildrenLink key={`child_${ele.frame_id}_${i}_${j}`} row={ele} i={i} j={j} select_link_handler={select_link_handler} check_handler={check_handler} />);
                })}
              </p>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure >
    </>
  );
}

const HeaderRow = () => {
  return (
    <div className="overflow-hidden bg-white shadow pl-10">
      <div className="border-t border-gray-200 py-5 sm:p-0">
        <dl className="divide-y sm:divide-gray-200">
          <div className="py-2 grid grid-cols-8 gap-4" onClick={() => { }}>
            <dd className="text-sm font-medium text-gray-500 col-span-2" >
              <Typography >{`frame_id`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 sm:mt-0">
              <Typography textOverflow={"ellipsis"}>{`x`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 sm:mt-0">
              <Typography textOverflow={"ellipsis"}>{`y`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 sm:mt-0">
              <Typography textOverflow={"ellipsis"}>{`z`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 sm:mt-0">
              <Typography textOverflow={"ellipsis"}>{`roll`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 sm:mt-0">
              <Typography textOverflow={"ellipsis"}>{`pitch`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 sm:mt-0">
              <Typography textOverflow={"ellipsis"}>{`yaw`}</Typography>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

const RowChildrenLink = ({ row, i, j, select_link_handler, check_handler }) => {
  return (<>
    <div className="overflow-hidden bg-white shadow pl-10">
      <div className="border-t border-gray-200 py-5 sm:p-0">
        <dl className="divide-y sm:divide-gray-200">
          <div className="py-2 grid grid-cols-8 gap-4 hover:bg-gray-200" onClick={() => {
            select_link_handler(row, i, j);
          }}>
            <dt className="text-sm font-medium text-gray-500 col-span-2 transform_table flex" >
              <Checkbox checked={row.view} sx={{ p: 1 }}
                onClick={(evt) => {
                  check_handler(row, i, j);
                  evt.stopPropagation();
                }}
              />
              <Typography>
                {row.frame_id}
              </Typography>
            </dt>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 transform_table">
              <Typography >{`${row.transform.x}`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 transform_table">
              <Typography >{`${row.transform.y}`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 transform_table">
              <Typography >{`${row.transform.z}`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 transform_table">
              <Typography >{`${row.transform.roll}`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 transform_table">
              <Typography>{`${row.transform.pitch}`}</Typography>
            </dd>
            <dd className="mt-1 text-sm text-gray-900 col-span-1 transform_table">
              <Typography >{`${row.transform.yaw}`}</Typography>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </>);
};