import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

const yaml = require('js-yaml');
const YAML = require('json-to-pretty-yaml');
const fs = require('fs');

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const sensor_calib_path = `${process.env.workspace}/src/sensor_kit/${process.env.sensor_model}_launch//${process.env.sensor_model}_description/config/sensors_calibration.yaml`
        const sensor_calib_txt = fs.readFileSync(sensor_calib_path, "utf8");

        const sensor_kit_calib_path = `${process.env.workspace}/src/sensor_kit/${process.env.sensor_model}_launch//${process.env.sensor_model}_description/config/sensor_kit_calibration.yaml`
        const sensor_kit_calib_txt = fs.readFileSync(sensor_kit_calib_path, "utf8");

        return NextResponse.json({
            sensors_calib: {
                file_name: "sensors_calibration.param.yaml",
                data: yaml.load(sensor_calib_txt),
                raw: sensor_calib_txt
            },
            sensor_kit_calib: {
                file_name: "sensor_kit_calibration.param.yaml",
                data: yaml.load(sensor_kit_calib_txt),
                raw: sensor_kit_calib_txt
            },
        });
    } catch (e) {
        return NextResponse.json({
            status: "load fail"
        })
    }
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const val = await req.json();
        let sensor = { base_link: {} };
        let sensor_kit = { sensor_kit_base_link: {} };
        for (var i of val.calib) {
            sensor.base_link[i.frame_id] = {
                x: i.transform.x,
                y: i.transform.y,
                z: i.transform.z,
                roll: i.transform.roll,
                pitch: i.transform.pitch,
                yaw: i.transform.yaw,
            }
            if (i.children !== undefined) {
                for (var j of i.children) {
                    sensor_kit.sensor_kit_base_link[j.frame_id] = {
                        x: j.transform.x,
                        y: j.transform.y,
                        z: j.transform.z,
                        roll: j.transform.roll,
                        pitch: j.transform.pitch,
                        yaw: j.transform.yaw,
                    }
                }
            }
        }

        const sensor_yaml = YAML.stringify(sensor)
        const sensor_kit_yaml = YAML.stringify(sensor_kit)

        const sensor_calib_path = `${process.env.workspace}/src/sensor_kit/${process.env.sensor_model}_launch//${process.env.sensor_model}_description/config/sensors_calibration.yaml`
        const sensor_kit_calib_path = `${process.env.workspace}/src/sensor_kit/${process.env.sensor_model}_launch//${process.env.sensor_model}_description/config/sensor_kit_calibration.yaml`
        
        fs.writeFileSync(sensor_calib_path, sensor_yaml);
        fs.writeFileSync(sensor_kit_calib_path, sensor_kit_yaml);
        // const path = `${process.env.workspace}/src/vehicle/${process.env.vehicle_model}_launch/${process.env.vehicle_model}_description/config/vehicle_info.param.yaml`
        // const yaml_txt = YAML.stringify(val)
        // // console.log(yaml_txt)
        // fs.writeFileSync(path, yaml_txt);
        return NextResponse.json({
            result: "success"
        });
    } catch (e) {
        console.log(e)
        return NextResponse.json({
            result: "error"
        })
    }
}