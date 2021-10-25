// Making an inline list of '' on what components the ShaderText will be built of - These inline vars will be loaded from external files later. This should be in gl language right? Since we compile it with gl.command later on.

const mat4 = glMatrix.mat4;

var vertexShaderText =
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',    // Output from our vertex shader
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'    fragColor = vertColor;',
'    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',    //vec4 is a fourdimensional vector - x, y and z comes from vertPosition and the last one is 1.0 (1.0 for position 0.0 for direction)
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',    // Input to our fragment shader
'void main()',
'{',
'    gl_FragColor = vec4(fragColor, 1.0);',    // Passing RGB with fragColor and then have alpha 1.0
'}'
].join('\n');

var InitDemo = function () {
    console.log('This is working');

    var canvas = document.getElementById('game-surface');
    var gl = canvas.getContext('webgl');	// Initialising webgl

    if (!gl) {
	console.log('WebGL not supported, falling back on experimental')
	gl = canvas.getContext('experimental-webgl');	//Initialising for Internet Explorer
    }

    if (!gl) {
	alet('Your browser does not support WebGL');    //If gl initialising not working and can't load experimental-webgl on Internet Explorer
    }

    /* canvas.width = window.innerWidth;    // Use this to change width and height dynamically through javascript
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight); */   

    gl.clearColor(0.75, 0.85, 0.8, 1.0);    // R G B Alpha
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);    // This is testing for depth so the rasteriser check if there are pixels already drawn and it only draws new pixels in its place when it's closer to the camera.
    gl.enable(gl.CULL_FACE);     // Render optimiser to only render one face at a time, it cuts of the selected face from rendering
    gl.frontFace(gl.CCW);    // Define frontface and it is defined by counter clockwise indeces
    gl.cullFace(gl.BACK);    // Cutting of backside from rendering so only render what is in front

    /* function vertexShader(vertPosition, vertColor) {
	return {
	    fragColor : vertColor,
	    gl_position: [vertPosition.x, vertPosition.y, 0.0, 1.0];
	} */

    //
    // Create shaders
    //

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); 

    gl.shaderSource(vertexShader, vertexShaderText);    //Compiling the shaders - compiling vertexShader with source found in vertexShaderText
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
	return;
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
	return;
    }

    var program = gl.createProgram();    // We need a program to put the things(shaders) together
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	console.error('ERROR linking program!', gl.getProgramInfoLog(program));
	return;
    }
    gl.validateProgram(program);    // This checks for additional errors and issues in the program but makes it longer to run so is only used for debugging
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
	console.error('ERROR validating program!', gl.getProgramInfoLog(program));
    return;
    }

    // Now the main vars and functions are intialised so we will make next
    // building blocks that the graphic cards will use - aka - create a buffer
    //
    
    var boxVertices =    // Currently this is sitting in RAM and only accessible to CPU. We define the vertices for the CPU to later send them to the GPU.
    [ // X, Y, Z		R, G, B
	// Top
	-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
	-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
	1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
	1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

	// Left
	-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
	-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
	-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
	-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

	// Right
	1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
	1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
	1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
	1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

	// Front
	1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
	1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
	-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
	-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

	// Back
	1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
	1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
	-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
	-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

	// Bottom
	-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
	-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
	1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
	1.0, -1.0, -1.0,    0.5, 0.5, 1.0


/*	// Top
	-1.0, 1.0, -1.0,	0.5, 0.5, 0.5,
	-1.0, 1.0, 1.0,		0.5, 0.5, 0.5,
	1.0, 1.0, 1.0,		0.5, 0.5, 0.5,
	1.0, 1.0, -1.0,		0.5, 0.5, 0.5,

	// Left
	-1.0, 1.0, 1.0,		0.75, 0.25, 0.5,
	-1.0, -1.0, 1.0,	0.75, 0.25, 0.5,
	-1.0, -1.0, -1.0,	0.75, 0.25, 0.5,
	-1.0, 1.0, -1.0,	0.75, 0.25, 0.5,

	// Right	
	1.0, 1.0, 1.0,		0.25, 0.25, 0.75,
	1.0, -1.0, 1.0,		0.25, 0.25, 0.75,
	1.0, -1.0, -1.0,	0.25, 0.25, 0.75,
	1.0, 1.0, -1.0,		0.25, 0.25, 0.75,

	// Front
	1.0, 1.0, 1.0,		1.0, 0.0, 0.15,
	1.0, -1.0, 1.0,		1.0, 0.0, 0.15,
	1.0, -1.0, -1.0,	1.0, 0.0, 0.15,
	1.0, 1.0, -1.0,		1.0, 0.0, 0.15,

	// Back
	1.0, 1.0, -1.0,		0.0, 1.0, 0.15,
	1.0, -1.0, -1.0,	0.0, 1.0, 0.15,
	-1.0, -1.0, -1.0,	0.0, 1.0, 0.15,
	-1.0, 1.0, 1.0,		0.0, 1.0, 0.15,

	// Bottom
	-1.0, 1.0, -1.0,	0.5, 0.5, 1.0,
	-1.0, -1.0, 1.0,	0.5, 0.5, 1.0,
	1.0, -1.0, 1.0,		0.5, 0.5, 1.0,
	1.0, -1.0, -1.0,	0.5, 0.5, 1.0
*/
    ];

    var boxIndices =
    [

	// Top
	0, 1, 2,
	0, 2, 3,

	// Left
	5, 4, 6,
	6, 4, 7,

	// Right
	8, 9, 10,
	8, 10, 11,

	// Front
	13, 12, 14,
	15, 14, 12,

	// Back
	16, 17, 18,
	16, 18, 19,

	// Bottom
	21, 20, 22,
	22, 20, 23

/*
	// Top
	0, 1, 2,
	0, 2, 3,

	// Left
	5, 4, 6,
	6, 4, 7,

	// Right
	8, 9, 10,
	8, 10, 11,

	// Front
	13, 12, 14,
	15, 14, 12,

	// Back
	16, 17, 18,
	16, 18, 19,

	// Bottom
	21, 20, 22,
	22, 20, 23
*/
    ];

    var boxVertexBufferObject = gl.createBuffer();   // Now we create the buffer used by the graphic card
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    // gl.ARRAY_BUFFER is the active buffer used by the graphic card and we bind the boxVertexBufferObject to it.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
    // loading data to buffer from boxVertices and outputing it to gl.STATIC_DRAW
    // opengl is expecting a 32 bit float array to gl.ARRAY_BUFFER and since javascript comes with 64 bit floats we convert it to correct bitsize.

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    // Adding attributes by assigning the correct location to them in the program program
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
	positionAttribLocation,    // Attribute location
	3,    // Number of elements per attribute
	gl.FLOAT,    // Type of elements
	gl.FALSE,    // Is the data normalised?
	6 * Float32Array.BYTES_PER_ELEMENT,    // Size of an individual vertex
	// This is important to let the graphic card now the size of the attribute that it will display. CPU knows that its 32bit (4 bytes per element) but GPU does not
	0    // Offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
	colorAttribLocation,    // Attribute location
	3,    // Number of elements per attribute
	gl.FLOAT,    // Type of elements
	gl.FALSE,    // Is the data normalised?
	6 * Float32Array.BYTES_PER_ELEMENT,    // Size of an individual vertex
	// This is important to let the graphic card now the size of the attribute that it will display. CPU knows that its 32bit (4 bytes per element) but GPU does not
	3 * Float32Array.BYTES_PER_ELEMENT    // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);    // Enable the vertexAttribArray for our Attriblocations
    gl.enableVertexAttribArray(colorAttribLocation);


    // Tell OpenGL state machine which program should be active

    gl.useProgram(program);

    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    var worldMatrix = new Float32Array(16);    // Declaring world, view and proj matrix
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    mat4.identity(worldMatrix);     // Initialise matrix for world, view and proj
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);    // Origin, look at, and direction of 'up'
    mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);    // Verical-field-of-view, aspect-ratio, closest object of rendered scene, farthest.

// Sending matrix worldMatrix to gl for processing of data. In WebGL gl.FALSE is always false. This value can be set to true if we need to transpose the matrix in OpenGL. 4 is how wide our matrix is and f is float.

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);
    

    //
    // Main render loop
    //

    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function () {

	angle = performance.now() / 1000 / 6 * 2 * Math.PI;
	mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);     // Dividing angle by 4 to make it rotate slower
	mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
	mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);    // Update the worldMatrix in the gpu

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);    // Clearing depth buffer and color buffer so gpu can draw new

	gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);    // Draw type of element, how many vertices, type of index, where to start

	requestAnimationFrame(loop);    // Update as often as the refresh rate

    };

    requestAnimationFrame(loop);

};
