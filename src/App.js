import React, { useState } from "react";
import { Engine, Scene, useScene } from "react-babylonjs";
import {
  Mesh,
  Curve3,
  Path3D,
  VertexData,
  Vector3,
  VertexBuffer,
  Color3,
  HighlightLayer,
  GlowLayer,
  PhysicsImpostor,
  FreeCamera,
  HemisphericLight,
  MeshBuilder
} from "@babylonjs/core";

import SceneComponent from "./SceneComponent"; // uses above component in same directory
// import SceneComponent from 'babylonjs-hook'; // if you install 'babylonjs-hook' NPM.
//import "./App.css";

import "./styles.css";

const CustomMesh = (props) => {
  const scene = useScene();

  const [customMesh] = useState(() => {
    const meshInstance = new Mesh(props.name, scene);

    //Set arrays for positions and indices
    var positions = [
      -5,
      2,
      -3,
      -7,
      -2,
      -3,
      -3,
      -2,
      -3,
      5,
      2,
      3,
      7,
      -2,
      3,
      3,
      -2,
      3
    ];
    var indices = [0, 1, 2, 3, 4, 5];
    var colors = [
      1,
      0,
      0,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      0,
      1,
      0,
      1,
      0,
      0,
      0,
      1,
      1,
      0,
      0,
      1,
      0,
      1
    ];

    //Empty array to contain calculated values
    var normals = [];

    var vertexData = new VertexData();
    VertexData.ComputeNormals(positions, indices, normals);

    //Assign positions, indices and normals to vertexData
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.colors = colors;

    //Apply vertexData to custom mesh
    vertexData.applyToMesh(meshInstance);

    return meshInstance;
  });

  return (
    <mesh
      fromInstance={customMesh}
      disposeInstanceOnUnmount
      position={props.position}
    >
      <standardMaterial
        name={`${props.name}-mat`}
        wireframe={props.useWireframe}
      />
    </mesh>
  );
};

// function App() {
//   return (
//     <Engine
//       antialias={true}
//       //   adaptToDeviceRatio={true}
//       canvasId="sample-canvas"
//       width={window.innerWidth}
//       height={window.innerHeight}
//     >
//       <Scene>
//         <freeCamera
//           name="camera1"
//           position={new Vector3(0, 2, -10)}
//           target={Vector3.Zero()}
//         />
//         <hemisphericLight
//           name="light1"
//           intensity={0.7}
//           direction={Vector3.Up()}
//         />
//         <sphere
//           name="sphere1"
//           diameter={2}
//           segments={16}
//           position={new Vector3(0, 1, 0)}
//         />
//         <ground name="ground1" width={6} height={6} subdivisions={2} />
//       </Scene>
//     </Engine>
//   );
// }

// export default App;

let box;
let lines;
// Array of points to construct line
const myPoints = [
  new Vector3(3, 0, 0),
  new Vector3(0, 3, 0),
  new Vector3(3, 3, 0)
];
//Array of paths to construct tube
var myPath = [
  new Vector3(5.0, 0, 0.0),
  new Vector3(0, 1, 0.1)
  //  new Vector3(-4.0, 6, 0.2)
];
// Array of paths to construct tube 2
var myPath2 = [
  // new Vector3(5.0, 0, 0.0),
  new Vector3(0, 1, 0.1),
  new Vector3(-4.0, 6, 0.2)
];
const options = {
  points: myPoints, //vec3 array,
  updatable: true
};

const onSceneReady = (scene) => {
  // This creates and positions a free camera (non-mesh)
  var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());

  const canvas = scene.getEngine().getRenderingCanvas();

  // The HighlightLayer relies on stencil to determine which part of the image it needs to paint.
  var engine = new Engine(canvas, true, { stencil: true });
  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  // Our built-in 'box' shape.
  box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
  // Our build-in 'line' shape
  //lines = MeshBuilder.CreateLines("lines", options);  //scene is optional
  // Update
  //options.points[0].x +=6;
  options.instance = lines;
  lines = MeshBuilder.CreateLines("lines", options); //No scene parameter when using instance

  // Our built-in 'tube' shape
  //Create ribbon with updatable parameter set to true for later changes
  var tube = MeshBuilder.CreateTube(
    "tube",
    {
      path: myPath,
      radius: 0.3,
      sideOrientation: Mesh.DOUBLESIDE,
      updatable: true
    },
    scene
  );
  var tube2 = MeshBuilder.CreateTube(
    "tube2",
    {
      path: myPath2,
      radius: 0.3,
      sideOrientation: Mesh.DOUBLESIDE,
      updatable: true
    },
    scene
  );

  // tube with multiple colors using vertex colors
  let pathPoints = [];
  for (let i = 0; i < 50; i++) {
    pathPoints.push(
      new Vector3(i - 25, 5 * Math.sin(i / 2), (i / 5) * Math.cos(i / 2))
    );
  }
  let curve = new Curve3(pathPoints);
  for (let i = 0; i < 2; i++) {
    curve = curve.continue(curve);
  }

  // Path3D
  let path3d = new Path3D(curve.getPoints());
  let numCylinders = 200;

  for (let i = 0; i < numCylinders; i++) {
    let sliceStart = (1 / numCylinders) * i;
    let sliceEnd = (1 / numCylinders) * (i + 1);
    let path = path3d.slice(sliceStart, sliceEnd).getPoints();
    let cylinder = MeshBuilder.CreateTube(
      "cylinder_" + i,
      {
        path: path,
        radius: 0.3,
        cap: Mesh.CAP_ALL
      },
      scene
    );
    let positions = cylinder.getVerticesData(VertexBuffer.PositionKind);
    let colors = new Array(positions.length * 4);

    let color = Color3.Random();
    for (let i = 0; i < positions.length; i++) {
      colors[i * 4 + 0] = color.r;
      colors[i * 4 + 1] = color.g;
      colors[i * 4 + 2] = color.b;
      colors[i * 4 + 3] = 1;
    }
    cylinder.setVerticesData(VertexBuffer.ColorKind, colors);
  }
  //Mesh.MergeMeshes(scene.meshes);

  // Move the box upward 1/2 its height
  box.position.x = -6;

  // Add the highlight layer.
  var hl = new HighlightLayer("hl1", scene);
  hl.addMesh(box, Color3.Green());

  // Add glow layer to tube
  var gl = new GlowLayer("glow", scene);
  gl.customEmissiveColorSelector = function (mesh, subMesh, material, result) {
    if (mesh.name === "tube") {
      result.set(1, 0, 1, 1);
    } else {
      result.set(0, 0, 0, 0);
    }
  };
  //gl.addIncludedOnlyMesh(tube);

  // Our built-in 'ground' shape.
  //MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
};

/**
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender = (scene) => {
  if (box !== undefined) {
    var deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 10;
    box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  }
};

export default () => (
  <div>
    {/* <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" /> */}
    <SceneComponent
      antialias
      onSceneReady={onSceneReady}
      onRender={onRender}
      id="my-canvas"
    />
  </div>
);
