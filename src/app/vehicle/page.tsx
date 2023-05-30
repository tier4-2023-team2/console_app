"use client";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { LoadingActionButton, get_vehicle_model, save_vehicle_model } from '~/common/util';
import { useEffect, useState } from 'react';
import { Card, Paper, TextField, Typography, styled } from '@mui/material';
import VehicleModelView from '~/components/vehicle_model_view';

import { StyledTableCell } from '~/common/util';
export default function Page() {

  const [vehicle_data, set_vehicle_data] = useState({});
  const init = async () => {
    const res = await get_vehicle_model();
    set_vehicle_data(res);
  }

  const save = async () => {
    const response = await save_vehicle_model(vehicle_data);
  }

  useEffect(() => {
    init();
  }, [])
  return (<>
    <div className="flex flex-row w-full h-full gap-4">
      <div className="sm:basis-1/3 w-96 h-full min-w-[400px] ">
        <Card sx={{ p: 4, mt: 2, ml: 2 }}>
          <TableContainer className='h-[620px]' component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell><Typography>ParamName</Typography></StyledTableCell>
                  <StyledTableCell><Typography>Value</Typography></StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(vehicle_data).map((ele, idx) => {
                  return (
                    <TableRow hover key={`key_${idx}`} >
                      <TableCell sx={{ py: 1, width: 150 }}>
                        <Typography>{ele}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1, width: 150 }}>
                        <TextField margin="dense"
                          // fullWidth
                          sx={{ m: 0, p: 0 }}
                          value={vehicle_data[ele]}
                          onChange={(e) => {
                            set_vehicle_data({
                              ...vehicle_data,
                              [ele]: parseFloat(e.target.value)
                            })
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <div className='w-full flex h-8 justify-end pr-4'>
            <LoadingActionButton async_fun={save} title={"SAVE"} />
          </div>
        </Card>
      </div>
      <div className="sm:basis-2/3 w-96 overflow-hidden">
        <div className="max-w-[720px]">
          <Card sx={{ p: 4, mt: 2, ml: 0 }}>
            <VehicleModelView vehicle_data={vehicle_data} />
          </Card>
        </div>
      </div>
    </div>
  </>);
}