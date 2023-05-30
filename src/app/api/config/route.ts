import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

const yaml = require('js-yaml');
const YAML = require('json-to-pretty-yaml');
const fs = require('fs');

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        return NextResponse.json({
            workspace: process.env.workspace,
            vehicle_model: process.env.vehicle_model,
            sensor_model: process.env.sensor_model,
            launch_prefix: process.env.launch_prefix?.replaceAll("\\n", "\n"),
            launch_suffix: process.env.launch_suffix?.replaceAll("\\n", "\n"),
        });
    } catch (e) {
        return NextResponse.json({
            status: "error",
        })
    }
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const path = `${process.env.npm_config_local_prefix}/.env`
        const txt = fs.readFileSync(path, "utf8");

        const data = await req.json();
        const config_keys = Object.keys(data.config);

        fs.writeFileSync(path, ""); //初期化
        config_keys.map((ele) => {
            const tmp = data.config[ele].replaceAll("\n", "\\n");
            process.env[ele] = tmp;
            fs.appendFileSync(path, `${ele}=${tmp}\n`)
        })

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
