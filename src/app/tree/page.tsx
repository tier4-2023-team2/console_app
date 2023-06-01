"use client";

import {
  get_calib_param, get_vehicle_model, save_calib_param, save_vehicle_model
} from '~/common/util';
import { useEffect, useState } from 'react';
import { Box, Button, Card, Checkbox, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormGroup, IconButton, Paper, Switch, Tab, Tabs, TextField, Typography, styled } from '@mui/material';
import VehicleModelView, { QuatanionPoseForm, DEFAULT_POSE, MyAxes, Vehicle, Ground, Sensor, BASE_LINK_TRANSFORM } from '~/components/vehicle_model_view';

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import { Disclosure } from '@headlessui/react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { CodeBlock, codepen } from "react-code-blocks";

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
  const [view_body, set_view_body] = useState(true);

  const init = async () => {
    const vechile_model = await get_vehicle_model();
    set_vehicle_data(vechile_model);
    const calib_param = await get_calib_param();
    set_calib(calib_param);
  }
  const save = async () => {
    const response = await save_calib_param(calib);
  }
  const delete_handler = (select_link) => {
    const idx_i = select_link.idx_i;
    const idx_j = select_link.idx_j;
    if (idx_j === undefined) {
      const new_link = calib.filter((ele, i) => {
        return i !== idx_i;
      })
      set_calib(new_link);
      set_select_link(default_link);
    } else {
      const new_link = calib.map((ele, i) => {
        if (i === idx_i) {
          return {
            ...ele,
            children: ele.children.filter((ele2, j) => {
              return j !== idx_j;
            })
          }
        }
        return ele;
      });
      set_calib(new_link);
      set_select_link(default_link);
    }
  }

  const link_update_handler = (new_form, frame_id, select_link) => {
    const idx_i = select_link.idx_i;
    const idx_j = select_link.idx_j;
    if (idx_j === undefined) {
      const new_link = calib.map((ele, i) => {
        if (i === idx_i) {
          return {
            ...ele,
            frame_id: frame_id,
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
                  frame_id: frame_id,
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
        view: val,
        view_all: val
      };
    });
    set_calib(new_calib);
  };

  const append_handler = (row, idx_i) => {
    if (row === undefined) {
      const add_frame = {
        ...default_link.tgt_frame,
        frame_id: `tmp_${parseInt(calib.length) + 1}_link`,
        view: true,
        view_all: true
      }
      const new_calib = [...calib, add_frame];
      set_calib(new_calib);
      return;
    }
    const idx = row.children === undefined ? 0 : row.children.length;
    const add_frame = {
      ...default_link.tgt_frame,
      frame_id: `${row.frame_id}_${idx + 1}`,
      view: true
    }
    const new_calib = calib.map((e, i) => {
      if (idx_i === i) {
        if (typeof row.children === "undefined") {
          return {
            ...e,
            children: [add_frame]
          }
        } else {
          return {
            ...e,
            children: [...e.children, add_frame]
          }
        }
      }
      return e;
    });
    set_calib(new_calib);
  }

  const PoseForm = ({ select_link, update_handler, delete_handler }) => {
    const [form, set_form] = useState(select_link.tgt_frame.transform);
    const [frame_id, set_frame_id] = useState(select_link.tgt_frame.frame_id);
    const [transform2, set_transform2] = useState(select_link.tgt_frame.transform);
    const [open_dialog, set_open_dialog] = useState(false);
    const [open_xacro_dialog, set_xacro_open_dialog] = useState(false);

    const update_form = () => {
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
        update_handler(new_form, frame_id, select_link);
      }
    }

    const delete_frame = () => {
      set_open_dialog(true);
    }

    return (<>
      <Box display={"flex"}>
        <Typography variant="h6">frame_id: </Typography>
        <TextField size="small" fullWidth value={frame_id} sx={{ ml: 2 }}
          onChange={(evt) => {
            set_frame_id(evt.target.value);
          }} />
      </Box>
      <Box sx={{ mt: 1 }}>
        <TextField size="small" label="Tree Structure" fullWidth InputProps={{
          readOnly: true,
        }}
          value={[...select_link.parents, { frame_id: frame_id }].map((ele, idx) => {
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
          <Button variant='outlined' sx={{ mr: "auto" }} disabled={frame_id === "base_link"}
            onClick={() => { set_xacro_open_dialog(true); }}> SHOW XACRO </Button>
          <Button variant='outlined'
            color="error"
            disabled={frame_id === "base_link"}
            onClick={() => { delete_frame() }}> delete </Button>
          <Button variant='outlined'
            disabled={frame_id === "base_link"}
            onClick={() => { update_form() }}> Update </Button>
        </Box>
      </Box>

      <div>
        <AlertDialog open={open_dialog}
          ok={() => {
            set_open_dialog(false);
            delete_handler(select_link);
          }}
          ng={() => {
            set_open_dialog(false);
          }} />
      </div>
      <div>
        <XacroDialog open={open_xacro_dialog} tgt={select_link.tgt_frame} parent={select_link.parents.slice(-1)[0]} close={() => { set_xacro_open_dialog(false) }} />
      </div>

      <QuatanionPoseForm transform={transform2} parents={select_link.parents} />
    </>);
  }

  return (<>
    <div className="flex flex-row w-full h-full gap-4">
      <div className="sm:basis-1/2 w-96 h-full min-w-[400px] ">
        <Card sx={{ p: 2, mb: 2, mt: 2, ml: 2 }} className='max-h-[96%] overflow-y-auto'>
          <Card >
            <Box display={"flex"} sx={{ mt: 1 }} className="justify-end">
              <Button variant='outlined' sx={{ mr: 1 }} onClick={() => { append_handler(); }}> APPEND FRAME </Button>
              <Button variant='outlined' sx={{ mr: 1 }} onClick={() => { save() }}> SAVE </Button>
            </Box>
          </Card>
          <div className="bg-white w-full">
            <div className="w-full">
              <div className="divide-y divide-gray-900/10 w-full">
                <dl className="mt-0 divide-y divide-gray-900/10 w-full">
                  {calib.map((row, i) => (
                    <RowFromBaseLink key={`row_${row.frame_id}`}
                      row={row} i={i}
                      select_link_handler={select_link_handler}
                      check_handler={check_handler}
                      append_handler={append_handler} />
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="sm:basis-1/2 w-96 overflow-hidden">
        <Card sx={{ p: 2, mb: 2, mt: 2 }} className='w-full max-h-[96%] overflow-y-auto'>
          <Card sx={{ p: 2, mt: 2, ml: 0 }}>
            <Box sx={{ height: "360px", width: "inherit" }}>
              <FormGroup sx={{ position: "absolute" }} className='z-10'>
                <FormControlLabel control={<Switch defaultChecked={view_body} onChange={() => {
                  set_view_body(!view_body);
                }} />} label="VehicleBody" />
              </FormGroup>
              {Object.keys(vehicle_data).length > 0 &&
                <Canvas style={{ position: "relative" }}>
                  <MyAxes />
                  <gridHelper args={[5, 10]} />
                  <gridHelper args={[5, 10]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />
                  <gridHelper args={[5, 10]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
                  <OrbitControls />
                  <ambientLight intensity={0.1} />
                  {view_body && <Vehicle vehicle_data={vehicle_data} />}
                  <Ground vehicle_data={vehicle_data} />
                  {calib.map((ele, idx_i) => {
                    if (ele.children === undefined) {
                      if (ele.view) {
                        return <Sensor key={`sensor_key_${idx_i}`} parents={[BASE_LINK_TRANSFORM]} child={ele.transform} frame_id={ele.frame_id} />
                      } else {
                        return (<></>)
                      }
                    }
                    return (<>
                      {ele.view && <Sensor key={`sensor_key_${idx_i}`} parents={[BASE_LINK_TRANSFORM]} child={ele.transform} frame_id={ele.frame_id} />}
                      {ele.children.map((ele2, idx_j) => {
                        if (ele2.view) {
                          return (<Sensor key={`child_sensor_key_${idx_i}_${idx_j}`} parents={[BASE_LINK_TRANSFORM, ele.transform]} child={ele2.transform} frame_id={ele2.frame_id} />);
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
              update_handler={link_update_handler}
              delete_handler={delete_handler}
            />
          </Card>
        </Card>
      </div>
    </div >
  </>);
}

const RowFromBaseLink = ({ row, i, select_link_handler, check_handler, append_handler }) => {
  return (
    <>
      <Disclosure as="div" key={row.frame_id} className="pt-6 w-full" defaultOpen={true}>
        {({ open }) => (
          <>
            <dt>
              <Disclosure.Button className="flex w-full text-left text-gray-900"
                onClick={(evt) => {
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

                <Button sx={{ ml: "auto", mr: 1 }} variant='outlined'
                  onClick={(evt) => {
                    append_handler(row, i);
                    evt.stopPropagation();
                  }}>
                  Append Child Frame
                </Button>
              </Disclosure.Button>
            </dt>
            <Disclosure.Panel as="dd" className="mt-2 pr-0">
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
    <div className="overflow-hidden bg-white shadow">
      <div className="border-t border-gray-200 p-0">
        <dl className="py-2 grid grid-cols-8 gap-4">
          <dt className="text-sm text-gray-900 col-span-1"></dt>
          <dt className="text-sm text-gray-900" >
            <Typography >{`frame_id`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900" >
            <Typography textOverflow={"ellipsis"}>{`x`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900" >
            <Typography textOverflow={"ellipsis"}>{`y`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900" >
            <Typography textOverflow={"ellipsis"}>{`z`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900" >
            <Typography textOverflow={"ellipsis"}>{`roll`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900" >
            <Typography textOverflow={"ellipsis"}>{`pitch`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900" >
            <Typography textOverflow={"ellipsis"}>{`yaw`}</Typography>
          </dt>
        </dl>
      </div>
    </div>
  );
}

const RowChildrenLink = ({ row, i, j, select_link_handler, check_handler }) => {
  return (<>
    <div className="overflow-hidden bg-white shadow">
      <div className="border-t border-gray-200 p-0">
        <dl className="p-0 grid grid-cols-8 gap-4 hover:bg-gray-200" onClick={() => {
          select_link_handler(row, i, j);
        }}>
          <dt className="text-sm font-medium text-gray-500 transform_table w-8" style={{ padding: 0 }}>
            <Checkbox checked={row.view} sx={{ p: 1, mr: 0 }}
              onClick={(evt) => {
                check_handler(row, i, j);
                evt.stopPropagation();
              }}
            />
          </dt>
          <dt className="text-sm text-gray-900 transform_table py-[9px]" >
            <Typography>{row.frame_id}</Typography>
          </dt>
          <dt className="text-sm text-gray-900 transform_table py-[9px]">
            <Typography >{`${row.transform.x}`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900 transform_table py-[9px]" >
            <Typography >{`${row.transform.y}`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900 transform_table py-[9px]" >
            <Typography >{`${row.transform.z}`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900 transform_table py-[9px]" >
            <Typography >{`${row.transform.roll}`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900 transform_table py-[9px]" >
            <Typography>{`${row.transform.pitch}`}</Typography>
          </dt>
          <dt className="text-sm text-gray-900 transform_table py-[9px]" >
            <Typography >{`${row.transform.yaw}`}</Typography>
          </dt>
        </dl>
      </div>
    </div>
  </>);
};

const AlertDialog = ({ open, ok, ng }) => {
  return (
    <Dialog
      open={open}
      onClose={ng}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Delete this frame?"}
      </DialogTitle>
      <DialogActions>
        <Button onClick={ng}>CANCEL</Button>
        <Button onClick={ok}>DELETE</Button>
      </DialogActions>
    </Dialog>
  );
}

const XacroDialog = ({ open, tgt, close, parent }) => {
  const [text, set_text] = useState("");
  const [value, setValue] = useState(0);
  useEffect(() => {
    console.log(tgt);
  }, [])
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  useEffect(() => {
    set_text(convert_text(tgt, macro_list[value], parent));
  }, [value]);

  const copy = async () => {
    await global.navigator.clipboard.writeText(text);
  }

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  const macro_list = [
    {
      name: "sensor_kit_macro",
      type: 0
    }, {
      name: "VLP-16",
      type: 1
    }, {
      name: "monocular_camera_macro",
      type: 2
    }, {
      name: "imu_macro",
      type: 3
    },
  ]

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth={"lg"}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"markup text for xacrofile"}
      </DialogTitle>
      <DialogContent>
        <Box display={"flex"} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            {macro_list.map((ele, i) => {
              return (<Tab key={`tab_${i}`} label={ele.name} {...a11yProps(i)} />);
            })}
          </Tabs>
        </Box>
        {macro_list.map((ele, i) => {
          return (<TabPanel value={value} index={i}>
            <CodeBlock
              text={text}
              language={"xml"}
              showLineNumbers={true}
              theme={codepen}
            />
          </TabPanel>);
        })}

      </DialogContent>
      <DialogActions>
        <Button onClick={() => { copy() }}>copy</Button>
        <Button onClick={() => { close() }}>close</Button>
      </DialogActions>
    </Dialog>
  );
}

const convert_text = (tgt, macro, parent) => {
  let txt = "";
  if (parent === undefined) {
    return "";
  }

  if (parent.frame_id === "base_link") {
    txt = `<xacro:property name="calibration" value="\${xacro.load_yaml('$(arg config_dir)/sensors_calibration.yaml')}"/> <!-- just once -->`;
  } else {
    txt = `<xacro:property name="calibration" value="\${xacro.load_yaml('$(arg config_dir)/sensor_kit_calibration.yaml')}"/> <!-- just once -->`;
  }

  if (macro.type === 0) { //sensor_kit_macro
    txt += `
  <xacro:${macro.name} parent="${parent.frame_id}"
  x="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['x']}"
  y="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['y']}"
  z="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['z']}"
  roll="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['roll']}"
  pitch="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['pitch']}"
  yaw="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['yaw']}"
/> `;
  } else if (macro.type === 1) { //VLP-16
    txt += `
<xacro:${macro.name} parent="${parent.frame_id}" name="${tgt.frame_id}" topic="${tgt.frame_id}/velodyne_points" hz="10" samples="220" gpu="false">
  <origin
    xyz="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['x']}
    \${calibration['${parent.frame_id}']['${tgt.frame_id}']['y']}
    \${calibration['${parent.frame_id}']['${tgt.frame_id}']['z']}"
    rpy="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['roll']}
    \${calibration['${parent.frame_id}']['${tgt.frame_id}']['pitch']}
    \${calibration['${parent.frame_id}']['${tgt.frame_id}']['yaw']}"/>
</xacro:${macro.name}>`;
  } else if (macro.type === 1) { //VLP-16
    txt += `
<xacro:${macro.name} parent="${parent.frame_id}" name="${tgt.frame_id}" topic="${tgt.frame_id}/velodyne_points" hz="10" samples="220" gpu="false">
<origin
  xyz="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['x']}
  \${calibration['${parent.frame_id}']['${tgt.frame_id}']['y']}
  \${calibration['${parent.frame_id}']['${tgt.frame_id}']['z']}"
  rpy="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['roll']}
  \${calibration['${parent.frame_id}']['${tgt.frame_id}']['pitch']}
  \${calibration['${parent.frame_id}']['${tgt.frame_id}']['yaw']}"/>
</xacro:${macro.name}>`;
  } else if (macro.type === 2) { //monocular_camera_macro
    txt += `
<xacro:${macro.name}
  name="${tgt.frame_id}"
  parent="${parent.frame_id}"
  namespace=""
  x="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['x']}"
  y="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['y']}"
  z="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['z']}"
  roll="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['roll']}"
  pitch="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['pitch']}"
  yaw="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['yaw']}"
  fps="30"
  width="800"
  height="400"
  fov="1.3"
  />`;
  } else if (macro.type === 3) { //imu_macro
    txt += `
<xacro:${macro.name}
  name="${tgt.frame_id}"
  parent="${parent.frame_id}"
  namespace=""
  x="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['x']}"
  y="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['y']}"
  z="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['z']}"
  roll="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['roll']}"
  pitch="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['pitch']}"
  yaw="\${calibration['${parent.frame_id}']['${tgt.frame_id}']['yaw']}"
  fps="100"
/>`;
  }
  return txt;
}
