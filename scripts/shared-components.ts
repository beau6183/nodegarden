interface Point {
	x : number;
	y : number;
}

interface Trajectory extends Point {
	xv : number;
	xy : number;
}

interface Container extends Point {
	w: number;
	h: number;
}

class Box {
	constructor (
		public x:number,
		public y:number,
		public w:number,
		public h:number
	){}
	public contains(x:number, y:number):boolean {
		return this.x <= x && x <= this.x + this.w
			&& this.y <= y && y <= this.y + this.h;
	}
}

class Nodule {
	
	private _radius:number = 0;
	private _mass:number = 0;
	
	/**
	 * Initial mass
	 */
	public set m(v:number) {
		if (v !== this._mass) {
			this._mass = v;
			this._radius = Math.pow((3 * v) / (4 * Math.PI), 1/3);
		}
	}
	
	public get m():number {
		return this._mass;
	}
	
	/**
	 * Spherical mass
	 */
	public get radius():number {
		return this._radius;
	}

	constructor (
			/**
			 * x coordinate
			 */
			public x: number = 0,
			
			/**
			 * y coordinate
			 */
			public y: number = 0,
			/**
			 * velocity along the x axis
			 */
			public vx: number = 0,
			/**
			 * velocity along the y axis
			 */
			public vy: number = 0,
			m: number = 0
		){
		this.m = m;
	}
}