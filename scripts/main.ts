/// <reference path="./shared-components.ts"/>

class SpaceController {
	
	public G:number = 6.67408e-5;
	
	public initialMass:number = 10;
	public criticalMass:number = 10000;
	
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
	
	public get nodeCount():number {
		return Math.sqrt((this.scaledHeight * this.scaledWidth) / 72) / this.pixelRatio | 0;
	}
	
	private nodes:Array<Nodule>;
	
	private ctx:CanvasRenderingContext2D;
	
	private canvas:HTMLCanvasElement;
	
	private renderRequest:number;
	
	constructor(public container:HTMLElement) {
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'nodegarden';
		this.ctx = this.canvas.getContext("2d");
		this.container.appendChild(this.canvas);
		this.nodes = new Array(this.nodeCount);
	}
	
	public init() {
		// create nodes
		let i:number, len:number;

		// set canvas size
		this.canvas.width = this.scaledWidth;
		this.canvas.height = this.scaledHeight;
		
		this.nodes.length = this.nodeCount;
		console.log({nodes: this.nodeCount, pxr: this.pixelRatio});
		
		if (this.pixelRatio !== 1) {
			// if retina screen, scale canvas
			this.canvas.style.transform = 'scale(' + 1 / this.pixelRatio + ')';
			this.canvas.style.transformOrigin = '0 0';
		}
		
		for (i = 0, len = this.nodes.length; i < len; i++) {
			if (this.nodes[i]) {
				continue;
			}
			this.nodes[i] = this.createNode();
		}
		if (this.renderRequest) {
			window.cancelAnimationFrame(this.renderRequest);
		}
		this.renderRequest = window.requestAnimationFrame(this.render.bind(this));
	}
	
	private createNode(n:Nodule = null):Nodule {
		if (!n) {
			n = new Nodule(
				Math.random() * this.scaledWidth,
				Math.random() * this.scaledHeight,
				Math.random() * 1 - 0.5,
				Math.random() * 1 - 0.5,
				this.initialMass
			);
		} else {
			n.x = Math.random() * this.scaledWidth;
			n.y = Math.random() * this.scaledHeight;
			n.vx = Math.random() * 1 - 0.5;
			n.vy = Math.random() * 1 - 0.5;
			n.m = this.initialMass;
		}
		return n;
	}
	
	public render() {
		let distance:number,
			impactAngle:number,
			vLoss:number,
			direction:Point,
			gForce:number,
			force:Point,
			deltaDistance:Point,
			i:number,
			j:number,
			len:number,
			nodeA:Nodule,
			nodeB:Nodule,
			node:Nodule;
		
		this.renderRequest = requestAnimationFrame(this.render.bind(this));
		
		// clear canvas
		this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
		this.ctx.fillRect(0, 0, this.scaledWidth, this.scaledHeight);
		for (i = 0, len = this.nodes.length - 1; i < len; i++) {
			for (j = i + 1; j < len + 1; j++) {
				nodeA = this.nodes[i];
				nodeB = this.nodes[j];
			
				deltaDistance = {
					x: nodeB.x - nodeA.x,
					y: nodeB.y - nodeA.y
				}
				
				distance = Math.sqrt(Math.pow(deltaDistance.x, 2) 
								   + Math.pow(deltaDistance.y, 2));
								   
				if (distance < nodeA.radius + nodeB.radius) {
					// collision: remove smaller or equal
					if (nodeA.m <= nodeB.m) {
						nodeA.x = Math.random() * this.scaledWidth;
						nodeA.y = Math.random() * this.scaledHeight;
						
						nodeB.vx += nodeA.vx * (nodeA.m / nodeB.m);
						nodeB.vy += nodeA.vy * (nodeA.m / nodeB.m);
						
						nodeA.vx = Math.random() * 1 - 0.5;
						nodeA.vy = Math.random() * 1 - 0.5;
						
						// Combine volumes
						nodeB.m += nodeA.m;
						if (nodeB.m > this.criticalMass) nodeB.m = this.initialMass;
						nodeA.m = this.initialMass;
					}
			
					if (nodeB.m <= nodeA.m) {
						nodeB.x = Math.random() * this.scaledWidth;
						nodeB.y = Math.random() * this.scaledHeight;
						
						nodeA.vx += nodeB.vx * (nodeB.m / nodeA.m);
						nodeA.vy += nodeB.vy * (nodeB.m / nodeA.m);
						
						nodeB.vx = Math.random() * 1 - 0.5;
						nodeB.vy = Math.random() * 1 - 0.5;
						// Combine volumes
						nodeA.m += nodeB.m;
						if (nodeA.m > this.criticalMass) nodeA.m = this.initialMass;
						nodeB.m = this.initialMass;
					}
					continue;
				}
				
				// maxDistance = radA * 5 + radB * 5
				// if (distance > maxDistance) {
				//   continue
				// }
				// calculate gravity direction
				direction = {
					x: deltaDistance.x / distance,
					y: deltaDistance.y / distance
				};
			
				// calculate gravity force
				gForce = this.G * ((nodeA.m * nodeB.m) / Math.pow(distance, 2));
				
				if (isNaN(gForce)) {
					continue;
				}
				// else if (gForce > 0.025) {
				// 	// cap force to a maximum value of 0.025
				// 	force = 0.025
				// }
				
				// if (gForce * 40 >= 0.01) {
				//   // draw gravity lines
				//   this.ctx.beginPath();
				//   this.ctx.strokeStyle = 'rgba(0,0,0,' + gForce * 40 + ')';
				//   this.ctx.moveTo(nodeA.x, nodeA.y);
				//   this.ctx.lineTo(nodeB.x, nodeB.y);
				//   this.ctx.stroke();
				// }
				
				force = {
					x: gForce * direction.x,
					y: gForce * direction.y
				};
				
				// calculate new velocity after gravity
				nodeA.vx += (nodeB.m / nodeA.m) * force.x;
				nodeA.vy += (nodeB.m / nodeA.m) * force.y;
				nodeB.vx -= (nodeA.m / nodeB.m) * force.x;
				nodeB.vy -= (nodeA.m / nodeB.m) * force.y;
			}
		}
		
		// update nodes
		for (i = 0, len = this.nodes.length; i < len; i++) {
			node = this.nodes[i];
			
			this.ctx.beginPath();
			this.ctx.fillStyle = 'rgba(' + Math.floor(255 * (node.m / this.criticalMass)) + ', 0, 0, 1)'; 
			this.ctx.arc(node.x, node.y, node.radius * this.pixelRatio, 0, 2 * Math.PI);
			this.ctx.fill();
		
			node.x += node.vx;
			node.y += node.vy;
			
			if (node.x <= 0) {
				impactAngle = this.impactLoss(node.vx, node.vy, true);
				vLoss = 1 - (0.5 * impactAngle);
				node.x = 0;
				node.vx *= -vLoss;
				node.vy *= vLoss;
				node.y += node.vy;
			} else if (node.x >= this.scaledWidth) {
				impactAngle = this.impactLoss(node.vx, node.vy, true);
				vLoss = 1 - (0.5 * impactAngle);
				node.x = this.scaledWidth;
				node.vx *= -vLoss;
				node.vy *= vLoss;
				node.y += node.vy;
			}
			
			if (node.y <= 0) {
				impactAngle = this.impactLoss(node.vx, node.vy, false);
				vLoss = 1 - (0.5 * impactAngle);
				node.y = 0;
				node.vy *= -vLoss;
				node.vx *= vLoss;
				node.x += node.vx;
			} else if (node.y >= this.scaledHeight) {
				impactAngle = this.impactLoss(node.vx, node.vy, false);
				vLoss = 1 - (0.5 * impactAngle);
				node.y = this.scaledHeight;
				node.vy *= -vLoss;
				node.vx *= vLoss;
				node.x += node.vx;
			}
		}
	}
	
	private impactLoss(deltaX:number, deltaY:number, isVertical:boolean):number {
		let degs = Math.abs(Math.atan(deltaY / deltaX)) * (180 / Math.PI);
  		if (isVertical) degs = 90 - degs;
  		return degs / 90;
	}
}