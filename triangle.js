// Making an inline list of '' on what components the ShaderText will be built of - These inline vars will be loaded from external files later. This should be in gl language right? Since we compile it with gl.command later on.

var vertexShaderText =
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',    // Output from our vertex shader
'',
'void main()',
'{',
'    fragColor = vertColor;',
'    gl_Position = vec4(vertPosition, 0.0, 1.0);',    //vec4 is a fourdimensional vector - x and y comes from vertPosition and z is 0.0 the last one is 1.0
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
    
    var triangleVertices =    // Currently this is sitting in RAM and only accessible to CPU. We define the vertices for the CPU to later send them to the GPU.
    [ // X, Y		R, G, B
	0.0, 0.5,	1.0, 1.0, 0.0,
	-0.5, -0.5,	0.7, 0.0, 1.0,
	0.5, -0.5,	0.1, 1.0, 0.6
    ];

    var triangleVertexBufferObject = gl.createBuffer();   // Now we create the buffer used by the graphic card
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    // gl.ARRAY_BUFFER is the active buffer used by the graphic card and we bind the triangleVertexBufferObject to it.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
    // loading data to buffer from triangleVertices and outputing it to gl.STATIC_DRAW
    // opengl is expecting a 32 bit float array to gl.ARRAY_BUFFER and since javascript comes with 64 bit floats we convert it to correct bitsize.

    // Adding attributes by assigning the correct location to them in the program program
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
	positionAttribLocation,    // Attribute location
	2,    // Number of elements per attribute
	gl.FLOAT,    // Type of elements
	gl.FALSE,    // Is the data normalised?
	5 * Float32Array.BYTES_PER_ELEMENT,    // Size of an individual vertex
	// This is important to let the graphic card now the size of the attribute that it will display. CPU knows that its 32bit (4 bytes per element) but GPU does not
	0    // Offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
	colorAttribLocation,    // Attribute location
	3,    // Number of elements per attribute
	gl.FLOAT,    // Type of elements
	gl.FALSE,    // Is the data normalised?
	5 * Float32Array.BYTES_PER_ELEMENT,    // Size of an individual vertex
	// This is important to let the graphic card now the size of the attribute that it will display. CPU knows that its 32bit (4 bytes per element) but GPU does not
	2 * Float32Array.BYTES_PER_ELEMENT    // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);    // Enable the vertexAttribArray for our Attriblocations
    gl.enableVertexAttribArray(colorAttribLocation);

    //
    // Main render loop
    //

    gl.useProgram(program);
    gl.drawArrays(
	gl.TRIANGLES,    // Type to draw
	0,   // How many vertices do we want to skip?
	3    // How many vertices do we want to draw?
);    // This functions takes three parameters and uses whatever the active buffer is set to

};
