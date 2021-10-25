class Canvas {
	constructor(w, h) {
		this.canvas;
		this.ctx;
		this.w = w;
		this.h = h;
		this.init();
	}
	init() {
		this.canvas = document.createElement("canvas");
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		this.canvas.style.position = "absolute";
		this.canvas.style.left = "0";
		this.canvas.style.top = "0";
		this.ctx = this.canvas.getContext("2d");
		this.ctx.fillRect(0, 0, this.w, this.h);
		document.body.appendChild(this.canvas);
	}
}

class Rect {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	contains(point) {
		const px = point.x;
		const py = point.y;

		return (
			px >= this.x &&
			px <= this.x + this.w &&
			py >= this.y &&
			py <= this.y + this.h
		);
	}

	intersects() {}
}

class Particle {
	constructor(x, y, size, userData) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.userData = userData;
	}
}

class QuadTree {
	constructor(rect, capacity) {
		this.rect = rect;
		this.capacity = capacity;
		this.points = [];
		this.isDivided = false;
	}

	subdivide() {
		this.isDivided = true;

		const x = this.rect.x;
		const y = this.rect.y;
		const w = this.rect.w / 2;
		const h = this.rect.h / 2;

		this.ne = new QuadTree(new Rect(x + w, y, w, h), this.capacity);
		this.nw = new QuadTree(new Rect(x, y, w, h), this.capacity);
		this.se = new QuadTree(new Rect(x, y + h, w, h), this.capacity);
		this.sw = new QuadTree(new Rect(x + w, y + h, w, h), this.capacity);

		this.points.slice().forEach((p) => this.insert(p));
		this.points = [];
	}

	insert(point) {
		if (!this.rect.contains(point)) {
			return;
		}
		if (!this.isDivided) {
			if (this.points.length < this.capacity) {
				this.points.push(point);
			} else {
				this.subdivide();
			}
		}
		if (this.isDivided) {
			this.ne.insert(point);
			this.nw.insert(point);
			this.se.insert(point);
			this.sw.insert(point);
		}
	}

	clear() {
		if (this.isDivided) {
			this.ne.clear();
			this.nw.clear();
			this.se.clear();
			this.sw.clear();
		}
		this.isDivided = false;
		this.points = [];
	}
}

const cv = new Canvas(600, 600);
const rect = new Rect(0, 0, 600, 600);
const qt = new QuadTree(rect, 5, cv);
let particles = [];

const renderQt = (qt) => {
	if (qt.isDivided) {
		renderQt(qt.ne);
		renderQt(qt.nw);
		renderQt(qt.se);
		renderQt(qt.sw);
	}
	cv.ctx.strokeStyle = "#000";
	cv.ctx.lineWidth = 1;
	cv.ctx.beginPath();
	cv.ctx.rect(qt.rect.x, qt.rect.y, qt.rect.w, qt.rect.h);
	cv.ctx.stroke();
};

const renderParticle = (x, y, size) => {
	cv.ctx.strokeStyle = "#000";
	cv.ctx.beginPath();
	cv.ctx.arc(x, y, size / 2, 0, 2 * Math.PI, true);
	cv.ctx.stroke();
};

const getVelocity = (velocity) => ({
	x: (Math.random() - 0.5) * velocity.x,
	y: (Math.random() - 0.5) * velocity.y
});

const addParticles = () => {
	for (let i = 0; i <= 100; i++) {
		particles.push(
			new Particle(
				Math.random() * 600,
				Math.random() * 600,
				3,
				getVelocity({ x: 1, y: 1 })
			)
		);
	}
};

const updateParticle = (p) => {
	if (p.x >= cv.canvas.width || p.x <= 0) {
		p.userData.x = -p.userData.x;
	}
	if (p.y >= cv.canvas.height || p.y <= 0) {
		p.userData.y = -p.userData.y;
	}
	p.x += p.userData.x;
	p.y += p.userData.y;
};

(() => {
	addParticles();
	const animate = () => {
		qt.clear();
		cv.ctx.clearRect(0, 0, cv.canvas.width, cv.canvas.height);
		particles.forEach((p) => {
			qt.insert(p);
			updateParticle(p);
			renderParticle(p.x, p.y, p.size);
		});
		renderQt(qt);
		requestAnimationFrame(animate);
	};
	animate();
})();
