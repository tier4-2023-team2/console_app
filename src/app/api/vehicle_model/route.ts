
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

const yaml = require('js-yaml');
const YAML = require('json-to-pretty-yaml');
const fs = require('fs');

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const path = `${process.env.workspace}/src/vehicle/${process.env.vehicle_model}_launch/${process.env.vehicle_model}_description/config/vehicle_info.param.yaml`
        const txt = fs.readFileSync(path, "utf8");
        return NextResponse.json({
            file_name: "vehicle_info.param.yaml",
            path: path,
            data: yaml.load(txt),
            raw: txt
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
        const path = `${process.env.workspace}/src/vehicle/${process.env.vehicle_model}_launch/${process.env.vehicle_model}_description/config/vehicle_info.param.yaml`
        const yaml_txt = YAML.stringify(val)
        fs.writeFileSync(path, yaml_txt);
        return NextResponse.json({
            result: "success"
        });
    } catch (e) {console.log(e)
        return NextResponse.json({
            result: "error"
        })
    }
}