
import { Box, Button, CircularProgress } from "@mui/material";
import { blue, cyan } from "@mui/material/colors";
import axios from "axios";
import { useRef, useState } from "react";

export const get_vehicle_model = async () => {
  const res = await axios.get('/api/vehicle_model', {
    headers: {
      "Content-Type": 'application/json',
      Accept: 'application/json',
    }
  });
  return res;
}

export const save_vehicle_model = async (vehicle_data) => {
  const res = await axios.post('/api/vehicle_model', {
    ["/**"]: {
      ["ros__parameters"]: vehicle_data
    }
  }, {
    headers: {
      "Content-Type": 'application/json',
      Accept: 'application/json',
    }
  });
  return res;
}

export const LoadingActionButton = ({ async_fun, title }) => {

  const timer = useRef<number>();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const buttonSx = {
    ...(success && {
      bgcolor: cyan[500],
      '&:hover': {
        bgcolor: blue[200],
      },
    }),
  };

  const click_evt = async () => {
    setSuccess(false);
    setLoading(true);
    const response = await async_fun();
    timer.current = window.setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 500);
  }

  return (<>

    <Box sx={{ m: 1, position: 'relative' }}>
      <Button variant='outlined' className='w-24'
        sx={buttonSx} onClick={() => { click_evt(); }}>
        {title}
      </Button>
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            color: cyan[600],
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '0px',
            marginLeft: '-12px',
          }}
        />
      )}
    </Box>
  </>);
}