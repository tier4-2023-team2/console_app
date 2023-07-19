"use client";

import { Card, TextField, Typography, styled } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useMemo, useState } from 'react';
import { LoadingActionButton, get_config_data, update_config_data } from '~/common/util';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#eee',
}));
const text_field_width = 500;

const Config = ({ config, title, value_key, prefix, setter }) => {
  return (<>
    <div className="w-full h-full">
      <label htmlFor="workspace" className="block text-md font-medium leading-6 text-gray-900">
        {title}
      </label>
      <div className="mt-2 w-full">
        <div className="flex w-full rounded-md ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
          <span className="flex select-none items-center pl-3 text-gray-500 text-md">{prefix}</span>
          <input
            type="text"
            id={title}
            className="block w-full flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-md sm:leading-6"
            placeholder="autoware_workspace_directory"
            value={config[value_key]}
            onChange={(evt) => {
              setter({
                ...config,
                [value_key]: evt.target.value
              })
            }}
          />
        </div>
      </div>
    </div>
  </>);
}


const ConfigMulti = ({ config, title, value_key, placeholder, setter }) => {
  return (<>
    <div className="w-full">
      <label htmlFor="workspace" className="block text-md font-medium leading-6 text-gray-900">
        {title}
      </label>
      <div className="mt-2 w-full">
        <div className="flex w-full rounded-md ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
          <textarea
            id={title}
            className="block w-full flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-md sm:leading-6"
            placeholder={placeholder}
            value={config[value_key]}
            onChange={(evt) => {
              setter({
                ...config,
                [value_key]: evt.target.value
              })
            }}
          />
        </div>
      </div>
    </div>
  </>);
}

export default function Page() {
  const [config, set_config] = useState({});

  const init = async () => {
    const response = await get_config_data();
    set_config(response);
  }

  const save = async () => {
    const response = await update_config_data(config);
  }

  useEffect(() => {
    init();
  }, [])


  return (<>
    <div className="flex h-full flex-row w-full gap-4 pl-4">
      <div className="w-full w-256 max-w-[800px]">
        <Card sx={{ p: 4, mt: 2 }} className='max-h-full'>
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 w-full">
            <Config config={config} title={"workspace"} value_key={"workspace"} prefix={"fullpath:"} setter={set_config} />
            <Config config={config} title={"vehicle_model"} value_key={"vehicle_model"} prefix={"vehicle_model:="} setter={set_config} />
            <Config config={config} title={"sensor_model"} value_key={"sensor_model"} prefix={"sensor_model:="} setter={set_config} />
            {/* <ConfigMulti config={config} title={"launch_prefix"} value_key={"launch_prefix"} placeholder={"launch prefix script"} setter={set_config} />
          <ConfigMulti config={config} title={"launch_suffix"} value_key={"launch_suffix"} placeholder={"launch suffix script"} setter={set_config} /> */}
          </div>
          <div className='w-full flex h-8 justify-end pr-4'>
            <LoadingActionButton async_fun={save} title={"SAVE"} />
          </div>
        </Card>
      </div>
    </div>

  </>);
}