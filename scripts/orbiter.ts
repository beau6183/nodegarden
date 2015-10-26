/// <reference path="shared-components.ts" />

class SpaceObject {
	
	constructor (
		/**
		* Name of object
		*/
		public name:string,
		
		/**
		* Velocity in km/s
		*/
		public velocity:number,
		/**
		* Distance from center in km
		*/
		public distance: number,
		public fillStyle: string,
		/**
		* Mass in kg
		*/
		mass:number,
		/**
		* Density in kg/m^3
		*/
		density:number,
		public exaggeration:number = 1
		){
		this.mass = mass;
		this.density = density;
	}
	
	private _mass:number = 0;
	/**
	 * Mass in kg
	 */
	public set mass(v:number) {
		if (v !== this._mass) {
			this._mass = v;
			this.measure();
		}
	}
	
	public get mass():number {
		return this._mass;
	}
	
	private _density:number = 1;
	/**
	 * Density in kg/m^3
	 */
	public set density(v:number) {
		if (v !== this._mass) {
			this._density = v;
			this.measure();
		}
	}
	
	public get density():number {
		return this._density;
	}
	
	private measure() {
		var v = this._mass / this._density;
		this._radius = Math.pow((3 * v) / (4 * Math.PI), 1/3) / 1000;
	}
	
	private _radius:number = 0;
	/**
	 * Spherical mass
	 */
	public get radius():number {
		return this._radius;
	}
	
	public x:number = 0;
	public y:number = 0;
	public vx:number = 0;
	public vy:number = 0;
}

class OrbitalController {
	public G:number = 6.67408e-11;

	protected solarSystem:Array<SpaceObject>;
	
	public get windowArea():number {
		return this.windowWidth * this.windowHeight;
	}
	
	public get pixelRatio():number {
		return window.devicePixelRatio;
	}
	
	public get windowWidth():number {
		return window.innerWidth;
	}
	
	public get windowHeight():number {
		return window.innerHeight;
	}
	
	public get scaledHeight():number {
		return this.windowHeight * this.pixelRatio;
	}
	
	public get scaledWidth():number {
		return this.windowWidth * this.pixelRatio;
	}
	
	private ctx:CanvasRenderingContext2D;
	
	private canvas:HTMLCanvasElement;
	
	private renderRequest:number;
	
	private scale:number = 1;
	
	private solarSystemBounds:Container;
	
	private initial:boolean = true;
	
	private lastTick:number;
	
	private tick:number = 0;
	
	constructor(public container:HTMLElement, solarSystem:Array<SpaceObject>) {
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'nodegarden';
		this.ctx = this.canvas.getContext("2d");
		
		if (this.pixelRatio !== 1) {
			// if retina screen, scale canvas
			this.canvas.style.transform = 'scale(' + 1 / this.pixelRatio + ')';
			this.canvas.style.transformOrigin = '0 0';
		}
		this.container.appendChild(this.canvas);
		this.solarSystem = solarSystem;
		window.addEventListener('resize', this.init.bind(this));
	}
	
	public init() {
		// set canvas size
		this.canvas.width = this.scaledWidth;
		this.canvas.height = this.scaledHeight;
		
		if (this.renderRequest) {
			//window.cancelAnimationFrame(this.renderRequest);
			clearTimeout(this.renderRequest);
		}
		this.lastTick = new Date().getTime();
		//this.renderRequest = window.requestAnimationFrame(this.render.bind(this));
		this.renderRequest = setTimeout(this.render.bind(this), 1000);
	}
	
	protected render() {
		let t = new Date().getTime();
		this.tick = t - this.lastTick;
		this.lastTick = t;
		// this.renderRequest = window.requestAnimationFrame(this.render.bind(this));
		this.renderRequest = setTimeout(this.render.bind(this), 1000);
		this.calculateSystemScale();
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
		this.ctx.fillRect(0, 0, this.scaledWidth, this.scaledHeight);
		this.solarSystem.forEach(this.draw.bind(this));
		this.initial = false;
	}
	
	protected calculateSystemScale() {
		var i:number,
			max:number = 0,
			so:SpaceObject;
		for (i = 0; i < this.solarSystem.length; i++) {
			so = this.solarSystem[i];
			max = Math.max(2 * (so.distance + so.radius), max);
		}
		this.scale = Math.min(this.scaledHeight, this.scaledWidth) / max;
	}
	
	protected draw(planet:SpaceObject) {
		var deltaDistance:Point,
			distance:number,
			direction:Point,
			gForce:number,
			force:Point;
		
		
		if (this.initial || planet === this.solarSystem[0]) {
			planet.y = (this.scaledHeight / 2);
			planet.x = (this.scaledWidth / 2) - (planet.distance * this.scale);
		}
		if (planet !== this.solarSystem[0]) {
			deltaDistance = {
				x: planet.distance,
				y: planet.distance
			};
			distance = planet.distance;
			direction = {
				x: deltaDistance.x / distance,
				y: deltaDistance.y / distance
			};
			gForce = this.G * ((this.solarSystem[0].mass * planet.mass) / Math.pow(distance, 2));
			if (isNaN(gForce)) {
				return;
			}
			force = {
				x: gForce * direction.x,
				y: gForce * direction.y
			};
			planet.vx -= (this.solarSystem[0].mass / planet.mass) * this.scale * force.x;
			planet.vy -= (this.solarSystem[0].mass / planet.mass) * this.scale * force.y;
			console.log({scale:this.scale,force:force,vx:planet.vx,vy:planet.vy,x:planet.x, y:planet.y});
		}
		
		
		this.ctx.beginPath();
		this.ctx.fillStyle = planet.fillStyle; 
		//this.ctx.arc(p.x, p.y, (planet.radius * this.scale) / this.objectExhaggeration, 0, 2 * Math.PI);
		this.ctx.arc(planet.x, planet.y, planet.radius * this.scale * planet.exaggeration, 0, 2 * Math.PI);
		this.ctx.fill();
		
		
		this.ctx.beginPath();
		this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
		this.ctx.arc(this.solarSystem[0].x, this.solarSystem[0].y, planet.distance * this.scale, 0, 2 * Math.PI);
		this.ctx.stroke();
		
		
		planet.x += planet.vx;
		planet.y += planet.vy;
	}
	
}