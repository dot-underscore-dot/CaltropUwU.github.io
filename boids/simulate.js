var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function startButtonPress() {
	var overlay = document.getElementById('overlay');
	var welcome = document.getElementById('welcome');

	overlay.style.animation = 'fadeOut 4s';
	welcome.style.animation = 'fadeOut 4s';

	setTimeout(() => {
		welcome.style.display = 'none';
		overlay.style.display = 'none';
	}, 3900);
}

window.addEventListener('resize', changeCanvasSize);
function changeCanvasSize() {
	canvas.style.width = window.innerWidth + 'px';
	canvas.style.height = window.innerHeight + 'px';

	flock.createLocalGroups(128);
}

var maxSpeed = 2;
var minSpeed = 0.1;
var maxForce = 0.001;

var seperationPerceptionRange = 25;
var alignmentPerceptionRange = 50;
var cohersionPerceptionRange = 75;

var seperationMultiplier = 1.8;
var alignmentMultiplier = 1;
var cohersionMultiplier = 1;

var trailLength = 8;

document.getElementById('seperation').oninput = function() {
	seperationMultiplier = this.value;
};
document.getElementById('alignment').oninput = function() {
	alignmentMultiplier = this.value;
};
document.getElementById('cohersion').oninput = function() {
	cohersionMultiplier = this.value;
};
document.getElementById('seperationper').oninput = function() {
	seperationPerceptionRange = this.value;
};
document.getElementById('alignmentper').oninput = function() {
	alignmentPerceptionRange = this.value;
};
document.getElementById('cohersionper').oninput = function() {
	cohersionPerceptionRange = this.value;
};
var debugRange = document.getElementById('debugRange');
debugRange.oninput = function() {
	if (flock) flock.debugify(this.value);
};

function clamp(n, min, max) {
	if (n < min) n = min;
	if (n > max) n = max;
	return n;
}

function average(arr) {
	return arr.reduce((p, c) => p + c, 0) / arr.length;
}

Victor.prototype.limitMagnitude = function(n) {
	if (this.length() > n) {
		this.normalize();
		this.multiply({ x: n, y: n });
	}
};

Victor.prototype.maxMagnitude = function(n) {
	this.normalize();
	this.multiply({ x: n, y: n });
};

class Random {
	constructor(seed) {
		this.m_w = 123456789;
		this.m_z = 987654321;
		this.mask = 0xffffffff;

		this.changeSeed = function(i) {
			this.m_w = (123456789 + i) & this.mask;
			this.m_z = (987654321 - i) & this.mask;
		};

		this.random = function() {
			this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
			this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
			let result = ((this.m_z << 16) + (this.m_w & 65535)) >>> 0;
			result /= 4294967296;
			return result;
		};

		this.changeSeed(seed);
	}
}
var rng = new Random(Date.now());
var flock = new Flock(100);
var cursor = new Cursor();

var repulsions = [];

var spawnMove = false;
var m2down = false;
var m2ClickId;
canvas.onmousedown = function(e) {
	if (e.which == 1) spawnMove = true;
	if (e.which == 3) {
		m2down = true;
		m2ClickId = ~~(rng.random() * 1000);
		repulsions.push(new RepulsionRadius(e.clientX, e.clientY, 128, m2ClickId));
	}
};
canvas.onmouseup = function(e) {
	if (e.which == 1) spawnMove = false;
	if (e.which == 3) m2down = false;
};
canvas.onmousemove = function(e) {
	var x, y;

	x = e.clientX - (canvas.offsetLeft + document.documentElement.scrollLeft);
	y = e.clientY - (canvas.offsetTop + document.documentElement.scrollTop);

	switch (e.which) {
		case 1:
			if (spawnMove) {
				flock.boids.push(new Boid(new Victor(x, y)));
			}
			break;
		case 2:
			e.preventDefault();
			break;
	}

	cursor.move(x, y);
};
window.addEventListener('contextmenu', (e) => {
	e.preventDefault();
});

var footer = document.getElementById('footer');

var lastLoop, currentLoop, fps;
lastLoop = Date.now();
var fpsArr = [];

changeCanvasSize();
setInterval(() => {
	debugRange.max = flock.boids.length - 1;

	currentLoop = Date.now();
	fps = 2000 / (currentLoop - lastLoop);
	lastLoop = currentLoop;
	if (isFinite(fps)) fpsArr.push(fps);
	if (fpsArr.length > 25) fpsArr.shift();

	footer.innerHTML = average(fpsArr).toFixed() + ' FPS, made by <a href="https://twitter.com/_Caltrop" target="_blank">@_Caltrop</a>';

	flock.update();
	for (let repulse of repulsions) {
		repulse.update(m2down, m2ClickId);
	}
	cursor.render();
	if (cursor.lastPosition.length > 1) cursor.lastPosition.shift();
}, 5);
