
import styled from "@emotion/styled";
import { Box, Button, CircularProgress, TableCell } from "@mui/material";
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
  return res.data.data["/**"]["ros__parameters"];
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

export const get_config_data = async () => {
  const response = await axios.get('/api/config', {
    headers: {
      "Content-Type": 'application/json',
      Accept: 'application/json',
    }
  });
  return response.data;
}

export const update_config_data = async (config) => {
  const response = await axios.post('/api/config', {
    config
  });
}


export const get_calib_param = async () => {
  const response = await axios.get('/api/sensor_kit', {
    headers: {
      "Content-Type": 'application/json',
      Accept: 'application/json',
    }
  });

  const base_link = (response.data.sensors_calib.data["base_link"]);
  const base_link_child = Object.keys(base_link).map((ele, idx) => {
    return {
      frame_id: ele,
      transform: base_link[ele],
      view: true,
      view_all: true
    }
  });
  const sensor_kit_base_link = (response.data.sensor_kit_calib.data["sensor_kit_base_link"]);
  const sensor_kit_base_link_child = Object.keys(sensor_kit_base_link).map((ele, idx) => {
    return {
      frame_id: ele,
      transform: sensor_kit_base_link[ele],
      view: true
    }
  })
  const sensor_link_map = base_link_child.map((ele, idx) => {
    if (ele.frame_id === "sensor_kit_base_link") {
      return {
        ...ele,
        children: sensor_kit_base_link_child
      }
    }
    return ele;
  })
  return sensor_link_map;
}

export const save_calib_param = async (calib) => {
  const response = await axios.post('/api/sensor_kit', {
    calib
  });

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


export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#ddd',
}));