{
	class Image3D {
		constructor(img) {
			const coord = img.getAttribute("data-coord").split(",");
			this.img = img;
			this.img.parent = this;
			this.css = this.img.style;
			this.x = coord[0] * 1.0;
			this.y = -coord[1] * 1.0;
			this.z = coord[2] * 1.0;
			this.sx = (coord[3] || 1) * 1.0;
			this.sy = (coord[4] || this.sx) * 1.0;
			this.w = 0;
			this.h = 0;
			this.ab = 100;
			this.loaded = false;
			this.visible = true;
		}
		load() {
			this.w = this.img.naturalWidth * this.sx;
			this.h = this.img.naturalHeight * this.sy;
			this.css.visibility = "visible";
			this.css.left = -this.w * 0.5 + "px";
			this.css.top = -this.h * 0.5 + "px";
			this.css.width = this.w + "px";
			this.css.height = this.h + "px";
			this.css.zIndex = 5000 - this.z;
			this.loaded = true;
		}
		display() {
			if (!this.loaded) {
				if (this.img.complete) {
					this.load();
				} else return;
			}
			const x = this.x - 2 * (pointer.ex - 0.5 * screenWidth);
			const y = this.y - pointer.ez + screenHeight * 0.5;
			const z = this.z + (-400 + 2500 / screenHeight * pointer.ey - screenHeight);
			const scale = this.z * (250 / (250 + this.z * z));
			const cx = screenWidth * 0.5 + x * scale;
			const cy = screenHeight * 0.5 + y * scale - this.h * scale * 0.5;
			if (
				z > 10 &&
				cx + scale * this.w * 0.5 > 0 &&
				cx - scale * this.w * 0.5 < screenWidth &&
				cy + scale * this.h * 0.5 > 0 &&
				cy - scale * this.h * 0.5 < screenHeight
			) {
				this.visible = true;
				this.css.transform = `matrix(${scale}, 0, 0, ${scale}, ${cx}, ${cy})`;
				const a = Math.max(0, Math.min(100, z));
				if (a != this.ab) {
					this.ab = a;
					this.css.opacity = a / 100;
				}
			} else {
				if (this.visible) {
					this.visible = false;
					this.css.transform = "matrix(0,0,0,0,0,0)";
				}
			}
		}
	}
	// screen size
	const resize = () => {
		screenWidth = screen.offsetWidth;
		screenHeight = screen.offsetHeight;
	};
	// setup pointer
	const pointer = {
		init(screen) {
			this.x = this.ex = screenWidth * 0.5;
			this.y = this.ey = screenHeight * 0.25;
			this.z = this.ez = -screenHeight;
			this.ey *= 0.5;
			window.addEventListener(
				"mousemove",
				e => {
					this.x = e.clientX;
					this.y = e.clientY;
				},
				false
			);
			screen.addEventListener(
				"touchmove",
				e => {
					e.preventDefault();
					this.x = e.targetTouches[0].clientX;
					this.y = e.targetTouches[0].clientY;
				},
				false
			);
			window.addEventListener(
				"wheel",
				e => {
					this.z += e.deltaY * 3;
					this.z = Math.min(screenHeight * 0.5, Math.max(-screenHeight * 2, this.z));
				},
				false
			);
			window.addEventListener("selectstart", e => e.preventDefault(), false);
		},
		ease(n) {
			this.ex += (this.x - this.ex) * n;
			this.ey += (this.y - this.ey) * n;
			this.ez += (this.z - this.ez) * n;
		}
	};
	// init pen
	const screen = document.getElementById("screen");
	let screenWidth = 0, screenHeight = 0;
	window.addEventListener("resize", () => resize(), false);
	resize();
	pointer.init(screen);
	const images = Array.prototype.map.call(
		screen.getElementsByTagName("img"),
		img => {
			return new Image3D(img);
		}
	);
	// animation loop
	const run = () => {
		requestAnimationFrame(run);
		pointer.ease(0.03);
		pointer.z *= 0.97;
		for (let img of images) {
			img.display();
		}
	};
	run();
}