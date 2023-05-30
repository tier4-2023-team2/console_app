"use client";

import { Box, Grid, TextField, Typography, linkClasses } from "@mui/material";

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { DoubleSide } from 'three';
import { CubeCamera, Cylinder, OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import * as THREE from "three"
import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { useLoader } from '@react-three/fiber';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';

export const BASE_LINK_TRANSFORM = {
  x: 0,
  y: 0,
  z: 0,
  roll: 0,
  pitch: 0,
  yaw: 0,
}

export const DEFAULT_POSE = {
  frame_id: "base_link",
  transform: {
    x: 0,
    y: 0,
    z: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
  }
}

export const AxisHelper = ({ color, direction, length }) => {
  const { scene } = useThree();

  const normalizedDirection = direction.normalize();
  const arrowHeadLength = length * 0.05;

  const arrowGeometry = new THREE.ConeGeometry(arrowHeadLength, arrowHeadLength * 2, 8);
  const arrowMaterial = new THREE.MeshBasicMaterial({ color });
  const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
  arrowMesh.position.copy(normalizedDirection.multiplyScalar(length - arrowHeadLength));

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), normalizedDirection.multiplyScalar(length - arrowHeadLength)]);
  const lineMaterial = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  line.material.linewidth = 3;
  // scene.add(arrowMesh);
  scene.add(line);

  return null;
};

export const MyAxes = () => {
  const axis_length = 3;
  return (<>
    <AxisHelper color="red" direction={new THREE.Vector3(0, 0, 1)} length={axis_length} />
    <AxisHelper color="green" direction={new THREE.Vector3(1, 0, 0)} length={axis_length} />
    <AxisHelper color="blue" direction={new THREE.Vector3(0, 1, 0)} length={axis_length} />
  </>)
}

export const VehicleBody = ({ vehicle_data }) => {
  if (vehicle_data === {}) {
    return (<></>);
  }
  return (
    <>
      {/* TODO ホイール分浮いているので、削るかどうにかする */}
      {/* main */}
      <mesh position={[
        0,
        (vehicle_data.vehicle_height + vehicle_data.wheel_radius) / 2,
        vehicle_data.wheel_base / 2]}>
        <boxGeometry args={[
          vehicle_data.wheel_tread,
          vehicle_data.vehicle_height - vehicle_data.wheel_radius,
          vehicle_data.wheel_base,
        ]} />
        <meshPhongMaterial color="#000088" opacity={0.5} transparent={true} />
      </mesh>

      {/* rear_overhang */}
      <mesh position={[0,
        (vehicle_data.vehicle_height + vehicle_data.wheel_radius) / 2,
        -vehicle_data.rear_overhang / 2]}>
        <boxGeometry args={[
          vehicle_data.wheel_tread,
          vehicle_data.vehicle_height - vehicle_data.wheel_radius,
          vehicle_data.rear_overhang,
        ]} />
        <meshPhongMaterial color="blue" opacity={0.5} transparent={true} />
      </mesh>

      {/* front_overhang */}
      <mesh position={[0,
        (vehicle_data.vehicle_height + vehicle_data.wheel_radius) / 2,
        vehicle_data.front_overhang / 2 + vehicle_data.wheel_base]}>
        <boxGeometry args={[
          vehicle_data.wheel_tread,
          vehicle_data.vehicle_height - vehicle_data.wheel_radius,
          vehicle_data.front_overhang,
        ]} />
        <meshPhongMaterial color="blue" opacity={0.5} transparent={true} />
      </mesh>
    </>
  );
}

export const VehicleWheel = ({ vehicle_data }) => {
  const offset = 0.0;
  if (vehicle_data === {}) {
    return (<></>);
  }
  return (
    <>
      {/* rear_left */}
      <mesh position={[vehicle_data.wheel_tread / 2 - vehicle_data.wheel_width / 2 - offset, vehicle_data.wheel_radius, 0]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[
          vehicle_data.wheel_radius, vehicle_data.wheel_radius,
          vehicle_data.wheel_width, 64
        ]} />
        <meshPhongMaterial color="red" />
      </mesh>

      {/* rear_right */}
      <mesh position={[-vehicle_data.wheel_tread / 2 + vehicle_data.wheel_width / 2 + offset, vehicle_data.wheel_radius, 0]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[
          vehicle_data.wheel_radius, vehicle_data.wheel_radius,
          vehicle_data.wheel_width, 64
        ]} />
        <meshPhongMaterial color="red" />
      </mesh>

      {/* front_left */}
      <mesh position={[vehicle_data.wheel_tread / 2 - vehicle_data.wheel_width / 2 - offset, vehicle_data.wheel_radius, vehicle_data.wheel_base]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[
          vehicle_data.wheel_radius, vehicle_data.wheel_radius,
          vehicle_data.wheel_width, 64
        ]} />
        <meshPhongMaterial color="red" />
      </mesh>

      {/* front_right */}
      <mesh position={[-vehicle_data.wheel_tread / 2 + vehicle_data.wheel_width / 2 + offset, vehicle_data.wheel_radius, vehicle_data.wheel_base]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[
          vehicle_data.wheel_radius, vehicle_data.wheel_radius,
          vehicle_data.wheel_width, 64
        ]} />
        <meshPhongMaterial color="red" />
      </mesh>

    </>
  );
}

export const VehicleSideOverhang = ({ vehicle_data }) => {
  if (vehicle_data === {}) {
    return (<></>);
  }
  return (
    <>
      <mesh position={[
        (vehicle_data.wheel_tread / 2 + vehicle_data.left_overhang / 2),
        (vehicle_data.vehicle_height + vehicle_data.wheel_radius) / 2,
        (vehicle_data.wheel_base + vehicle_data.front_overhang - vehicle_data.rear_overhang) / 2
      ]}>
        <boxGeometry args={[
          vehicle_data.left_overhang, //y
          vehicle_data.vehicle_height - vehicle_data.wheel_radius, //z
          vehicle_data.front_overhang + vehicle_data.wheel_base + vehicle_data.rear_overhang,//x
        ]} />
        <meshPhongMaterial color="#aaaaff" opacity={0.5} transparent={true} />
      </mesh>

      <mesh position={[
        -(vehicle_data.wheel_tread / 2 + vehicle_data.right_overhang / 2),
        (vehicle_data.vehicle_height + vehicle_data.wheel_radius) / 2,
        (vehicle_data.wheel_base + vehicle_data.front_overhang - vehicle_data.rear_overhang) / 2
      ]}>
        <boxGeometry args={[
          vehicle_data.right_overhang, //y
          vehicle_data.vehicle_height - vehicle_data.wheel_radius, //z
          vehicle_data.front_overhang + vehicle_data.wheel_base + vehicle_data.rear_overhang,//x
        ]} />
        <meshPhongMaterial color="#aaaaff" opacity={0.5} transparent={true} />
      </mesh>
    </>);
}

export const Ground = ({ vehicle_data }) => {
  if (vehicle_data === {}) {
    return (<></>);
  }
  return (<>
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[
        (vehicle_data.wheel_base + vehicle_data.front_overhang + vehicle_data.rear_overhang) * 2.5,
        (vehicle_data.wheel_base + vehicle_data.front_overhang + vehicle_data.rear_overhang) * 2.5
      ]} />
      <meshStandardMaterial color="rgba(255,255,255,1)" side={DoubleSide} />
    </mesh>
  </>)
}


export const Model = ({ vehicle_data }) => {
  const path = `lexus.dae`;
  const { scene } = useLoader(ColladaLoader, path);

  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // 赤色
  return <primitive object={scene}
    position={[0, 0, vehicle_data.wheel_base / 2]}
    rotation={[0, Math.PI / 2, 0]}
    dispose={null}
    material={material}
  />;
}

export const Vehicle = ({ vehicle_data }) => {
  return (<>
    <VehicleBody vehicle_data={vehicle_data} />
    <VehicleWheel vehicle_data={vehicle_data} />
    <VehicleSideOverhang vehicle_data={vehicle_data} />
  </>)
}

export default function VehicleModelView({ vehicle_data }) {
  const default_pos = 4.5;
  return (<>
    <Box sx={{ height: "630px" }}>
      <Canvas camera={{ position: [default_pos, default_pos, default_pos] }}>
        {/* <PerspectiveCamera position={[2, 2, 2]} fov={60} /> */}
        <MyAxes />
        <gridHelper args={[10, 20]} />
        <gridHelper args={[10, 20]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <gridHelper args={[10, 20]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} />

        <OrbitControls />
        <ambientLight intensity={0.1} />
        {Object.keys(vehicle_data).length > 0 &&
          <>
            <Vehicle vehicle_data={vehicle_data} />
            <Ground vehicle_data={vehicle_data} />
          </>
        }
      </Canvas>
    </Box>
  </>)

}

export const AxisHelper2 = ({ color, direction, length, pos }) => {
  const { scene } = useThree();
  console.log(pos)
  const normalizedDirection = direction.normalize();
  const arrowHeadLength = length * 0.05;

  const arrowGeometry = new THREE.ConeGeometry(arrowHeadLength, arrowHeadLength * 2, 8);
  const arrowMaterial = new THREE.MeshBasicMaterial({ color });
  const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
  arrowMesh.position.copy(normalizedDirection.multiplyScalar(length - arrowHeadLength));

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(
    [[pos.x, pos.y, pos.z], normalizedDirection.multiplyScalar(length - arrowHeadLength)]);
  const lineMaterial = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  line.material.linewidth = 3;

  scene.add(line);

  return null;
};


export const MyAxes2 = ({ pos }) => {
  const axis_length = 0.3;
  return (<>
    {/* <AxisHelper2
            color="red"
            direction={new THREE.Vector3(0, 0, 1)}
            length={axis_length}
            pos={pos}
        /> */}
  </>)
}


function Cube2({ parents, child, frame_id }) {
  const cubeRef = useRef();

  useFrame(() => {
    updateTransforms();
  });

  function updateTransforms() {
    const joint_list = [...parents, child];
    const child_idx = joint_list.length - 1;
    const rotation_order = "ZYX";
    const list = joint_list.map((ele) => {
      let link = new THREE.Object3D();
      link.position.set(ele.x, ele.y, ele.z);
      link.rotation.set(ele.roll, ele.pitch, ele.yaw, rotation_order);
      return link;
    })

    for (var i = 0; i < list.length - 1; i++) {
      list[i].add(list[i + 1]);
    }
    list.forEach(element => {
      element.updateMatrixWorld();
    });

    let pos = new THREE.Vector3();
    pos.setFromMatrixPosition(list[child_idx].matrixWorld);
    let qua = new THREE.Quaternion();
    qua.setFromRotationMatrix(list[child_idx].matrixWorld);

    let globalPosition2 = new THREE.Vector3(pos.y, pos.z, pos.x);
    let globalQuaternion = new THREE.Quaternion(qua._y, qua._z, qua._x, qua._w);
    let euler = new THREE.Euler();
    euler.setFromQuaternion(globalQuaternion, 'XYZ');


    cubeRef.current.rotation.copy(euler);
    cubeRef.current.position.copy(globalPosition2);

  }
  const cube_size = 0.1;
  return (
    <>
      <mesh ref={cubeRef}
        onClick={() => {
          // console.log(child, frame_id)
        }}
      >
        <boxGeometry args={[cube_size, cube_size, cube_size]} />
        <meshBasicMaterial color={0x00ff00} wireframe={true} opacity={0.5} transparent={true} />
        <CubeAxes link={[...parents, child]} frame_id={frame_id} />
      </mesh>
    </>
  );
}


export const CubeAxisHelper = ({ color, direction, length }) => {
  const { scene } = useThree();

  const normalizedDirection = direction.normalize();
  const arrowHeadLength = length * 0.05;

  const arrowGeometry = new THREE.ConeGeometry(arrowHeadLength, arrowHeadLength * 2, 8);
  const arrowMaterial = new THREE.MeshBasicMaterial({ color });
  const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
  arrowMesh.position.copy(normalizedDirection.multiplyScalar(length - arrowHeadLength));

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), normalizedDirection.multiplyScalar(length - arrowHeadLength)]);
  const lineMaterial = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  line.material.linewidth = 3;
  // scene.add(arrowMesh);
  scene.add(line);

  return null;
};

const CubeAxes = ({ link, frame_id }) => {
  const axisRef = useRef();
  const length = 0.125;
  const linewidth = 2.5;

  useFrame(() => { });
  return (
    <group ref={axisRef}>
      <line>
        <bufferGeometry attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints(
            [new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0)])} />
        <lineBasicMaterial color="green" attach="material" linewidth={linewidth} />
      </line>
      <line>
        <bufferGeometry attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints(
            [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0)])} />
        <lineBasicMaterial color="blue" attach="material" linewidth={linewidth} />
      </line>
      <line>
        <bufferGeometry attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints(
            [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length)])} />
        <lineBasicMaterial color="red" attach="material" linewidth={linewidth} />
      </line>
    </group>
  );
};

export function Sensor({ parents, child, frame_id }) {
  return (<>
    <Cube2 parents={parents} child={child} frame_id={frame_id} />
  </>);
}

export function QuatanionPoseForm({ transform, parents }) {
  const [pos, set_abs_pos] = useState({ x: 0, y: 0, z: 0 });
  const [quo, set_abs_rotation] = useState({ _x: 0, _y: 0, _z: 0, _w: 1 });
  useEffect(() => {
    const joint_list = [...parents, { transform: transform }];
    const child_idx = joint_list.length - 1;
    const rotation_order = "ZYX";
    const list = joint_list.map(({ transform: { x, y, z, roll, pitch, yaw } }) => {
      let link = new THREE.Object3D();
      link.position.set(x, y, z);
      link.rotation.set(roll, pitch, yaw, rotation_order);
      return link;
    })

    for (var i = 0; i < list.length - 1; i++) {
      list[i].add(list[i + 1]);
    }

    list.forEach(element => {
      element.updateMatrixWorld();
    });

    let pos = new THREE.Vector3();
    pos.setFromMatrixPosition(list[child_idx].matrixWorld);
    let qua = new THREE.Quaternion();
    qua.setFromRotationMatrix(list[child_idx].matrixWorld);
    let euler = new THREE.Euler();
    euler.setFromQuaternion(qua, 'XYZ');
    const transformMatrix = new THREE.Matrix4();
    let pos2 = new THREE.Vector3(pos.x, pos.y, pos.z);
    let qua2 = new THREE.Quaternion(qua._x, qua._y, qua._z, qua._w);
    let euler2 = new THREE.Euler();
    euler2.setFromQuaternion(qua2, 'XYZ');
    transformMatrix.compose(pos2, qua2, new THREE.Vector3(1, 1, 1));

    set_abs_pos(pos2);
    set_abs_rotation(qua2);

  }, [transform]);

  return (<>
    <Box>
      <Typography variant="h6">
        Position from base_link
      </Typography>
    </Box>
    <Box display={"flex"}>
      <TextField label={"x"} value={pos["x"]} size="small" InputProps={{
        readOnly: true,
      }} />
      <TextField label={"y"} value={pos["y"]} size="small" InputProps={{
        readOnly: true,
      }} />
      <TextField label={"z"} value={pos["z"]} size="small" InputProps={{
        readOnly: true,
      }} />
    </Box>

    <Box>
      <Typography variant="h6">
        Orientation
      </Typography>
    </Box>
    <Box display={"flex"} sx={{ mt: 1 }}>
      <TextField label={"_x"} value={quo["_x"]} size="small" InputProps={{
        readOnly: true,
      }} />
      <TextField label={"_y"} value={quo["_y"]} size="small" InputProps={{
        readOnly: true,
      }} />
      <TextField label={"_z"} value={quo["_z"]} size="small" InputProps={{
        readOnly: true,
      }} />
      <TextField label={"_w"} value={quo["_w"]} size="small" InputProps={{
        readOnly: true,
      }} />
    </Box>
  </>);
}
