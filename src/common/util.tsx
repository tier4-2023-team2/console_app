
import axios from "axios";

export const get_vehicle_model = async () => {
  const res = await axios.get('/api/vehicle_model', {
    headers: {
      "Content-Type": 'application/json',
      Accept: 'application/json',
    }
  });
  return res;
} 
