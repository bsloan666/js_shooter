main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uWorldMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      vec4 vp = uWorldMatrix * aVertexPosition;  
      gl_Position = uProjectionMatrix * uModelViewMatrix * vp;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      worldMatrix: gl.getUniformLocation(shaderProgram, 'uWorldMtrix'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  // Draw the scene
  drawScene(gl, programInfo, buffers);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
function initBuffers(gl) {

  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.

  const positions = [
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,

        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,

        0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,

        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,

         0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
         0.5, 0.5, -0.5,

        -0.5, -0.5, 0.5,
         -0.5, -0.5, -0.5,
         -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
  ];
   //     [0, 1, 2, 3],
   //     [7, 6, 5, 4],
   //     [1, 0, 7, 6],
   //     [3, 2, 5, 4],
   //     [1, 6, 5, 2],
   //     [7, 0, 3, 4]
  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the vertices

  var colors = [
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  1.0,  1.0,  1.0,    // white
  ];

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
  };
}

function syncState() {
    var xhttp = new XMLHttpRequest();
    var url = "/sync_state";
    var data = new FormData();
    var i;

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var scene = JSON.parse(this.responseText);
            for (i = 0; i < scene.length; i++) {
                console.log(scene[i]['name']);
                document.getElementById(i).value = JSON.stringify(scene[i]);
            }
        }
    };

    var name = document.getElementById("player_name").innerText;
    var orientation = Number(document.getElementById("o_roty").value);
    var posx = Number(document.getElementById("o_trnx").value);
    var posz = Number(document.getElementById("o_trnz").value);

    console.log(name + " " + orientation + " " + posx + " " + posz);

    xhttp.open("POST", url, true);
    data.append('player_name', name);
    data.append('player_orientation', orientation);
    data.append('player_posx', posx);
    data.append('player_posz', posz);

    xhttp.send(data);
}

function handleKey(event){
    var ry = Number(document.getElementById("o_roty").value)  
    var tx = Number(document.getElementById("o_trnx").value)  
    var tz = Number(document.getElementById("o_trnz").value)  
    if(event.keyCode == 37){
        ry += 0.1;
    }
    if(event.keyCode == 38){
        tz -= 0.1;
        //tz -= Math.cos(ry) * 0.1;
        //tx -= Math.sin(ry) * 0.1;
    }
    if(event.keyCode == 39){
        ry -= 0.1;
    }
    if(event.keyCode == 40){
        tz +=  0.1;
        //tz += Math.cos(ry) * 0.1;
        //tx += Math.sin(ry) * 0.1;
    }
    if(event.keyCode == 32){
        document.getElementById("is_blast").value = 1 
        document.getElementById("blast_trnz").value = 0.3
        var audio = new Audio('static/audio/blast.ogg');
        audio.play();
        syncState();
    }
    // console.log(event.keyCode)
    document.getElementById("o_roty").value = ry 
    document.getElementById("o_trnx").value = tx 
    document.getElementById("o_trnz").value = tz
}
//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things


  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  const worldMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  const modelViewMatrix = mat4.create();

  var ry = Number(document.getElementById("o_roty").value);  
  mat4.rotate(   modelViewMatrix,    
                 modelViewMatrix,
                 ry,
                 [0.0, 1.0, 0.0]);  // axis

  var tx = Number(document.getElementById("o_trnx").value);  
  var tz = Number(document.getElementById("o_trnz").value);  
  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, tz]);  // amount to translate

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);


    var index = 0;
    var name = document.getElementById("player_name").innerText;
    var players = document.getElementsByClassName('player');

  {
    for( index = 0; index < players.length; index++) {
        if(players[index].value != '' && players[index]['name'] != name) {
            player = JSON.parse(players[index].value);
            var tx2 = player['position'][0];
            var tz2 = player['position'][1];
            var ry2 = player['orientation'];
            var offset = 0;
            mat4.identity(worldMatrix);
            mat4.rotate(worldMatrix,    
                 worldMatrix,
                 ry2,
                 [0.0, 1.0, 0.0]);  // axis
            //mat4.translate(worldMatrix,     // destination matrix
            //     worldMatrix,     // matrix to translate
            //     [tx2, 0.0, tz2]);  // amount to translate
            gl.uniformMatrix4fv(
                 programInfo.uniformLocations.worldMatrix,
                 false,
                 worldMatrix);
            for(offset = 0; offset < 24; offset+=4) {
                gl.drawArrays(gl.LINE_LOOP, offset, 4);
            }
        }
    }
  }
  window.requestAnimationFrame(function() {
        drawScene(gl, programInfo, buffers);
  });
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

