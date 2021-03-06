// App constructor
let App = function(canvas, overlay) {
	this.canvas = canvas;
	this.overlay = overlay;

	// if no GL support, cry
	this.gl = canvas.getContext("experimental-webgl");
	if (this.gl === null) {
		throw new Error("Browser does not support WebGL");

	}
	this.gl.pendingResources = {};
	// create a simple scene
	this.scene = new Scene(this.gl);

	this.resize();

	this.keysPressed = {};

  	this.mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0,
    };

    this.quakeCount = 0;
};

// match WebGL rendering resolution and viewport to the canvas size
App.prototype.resize = function() {
	this.canvas.width = this.canvas.clientWidth;
	this.canvas.height = this.canvas.clientHeight;
	this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

	this.scene.camera.setAspectRatio(
    this.canvas.clientWidth /
    this.canvas.clientHeight );
};

App.prototype.registerEventHandlers = function() {
	let theApp = this;
	document.onkeydown = function(event) {
		theApp.keysPressed[keyboardMap[event.keyCode]] = true;
	};
	document.onkeyup = function(event) {
		if (theApp.keysPressed.Q) {
			theApp.scene.updateQuakeCount();
		}
		theApp.keysPressed[keyboardMap[event.keyCode]] = false;
	};
	this.canvas.onmousedown = function(event) {
     	let x = (event.clientX/theApp.canvas.width - 0.5)*2;
     	let y = (event.clientY/theApp.canvas.height - 0.5)*-2;
     	vec = new Vec4(x, y, 0, 1);
     	mat = new Mat4(theApp.scene.camera.viewProjMatrix).invert();
     	result = vec.mul(mat);
     	theApp.mouse.startX = Math.round(result.x);
  		theApp.mouse.startY = Math.round(result.y);
     	theApp.scene.mouseClicked(theApp.mouse);
	};

	this.canvas.onmousemove = function(event) {
		//jshint unused:false
		let x = (event.clientX/theApp.canvas.width - 0.5)*2;
     	let y = (event.clientY/theApp.canvas.height - 0.5)*-2;
     	vec = new Vec4(x, y, 0, 1);
     	mat = new Mat4(theApp.scene.camera.viewProjMatrix).invert();
     	result = vec.mul(mat);
     	theApp.mouse.x = result.x;
  		theApp.mouse.y = result.y;
     	theApp.scene.mouseMoved(theApp.mouse);

		event.stopPropagation();
	};
	this.canvas.onmouseout = function(event) {

	};
	this.canvas.onmouseup = function(event) {
		let x = (event.clientX/theApp.canvas.width - 0.5)*2;
     	let y = (event.clientY/theApp.canvas.height - 0.5)*-2;
     	vec = new Vec4(x, y, 0, 1);
     	mat = new Mat4(theApp.scene.camera.viewProjMatrix).invert();
     	result = vec.mul(mat);
     	theApp.mouse.x = Math.round(result.x);
  		theApp.mouse.y = Math.round(result.y);
     	theApp.scene.mouseUp(theApp.mouse);
	};
	window.addEventListener('resize', function() {
		theApp.resize();
	});
	window.requestAnimationFrame(function() {
		theApp.update();
	});
};

// animation frame update
App.prototype.update = function() {

	let pendingResourceNames = Object.keys(this.gl.pendingResources);
	if (pendingResourceNames.length === 0) {
		// animate and draw scene
		this.scene.update(this.gl, this.keysPressed);
		this.overlay.innerHTML = "Ready.";
	} else {
		this.overlay.innerHTML = "Loading: " + pendingResourceNames;
	}

	// refresh
	let theApp = this;
	window.requestAnimationFrame(function() {
		theApp.update();
	});
};

// entry point from HTML
window.addEventListener('load', function() {
	let canvas = document.getElementById("canvas");
	let overlay = document.getElementById("overlay");
	overlay.innerHTML = "WebGL";

	let app = new App(canvas, overlay);
	app.registerEventHandlers();
});