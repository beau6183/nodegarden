/// <reference path="./shared-components.ts"/>

class NBodyController {
	
	public G:number = 6.67408e-4; // Real gravitational constant = 6.67408e-11, too weak...
	
    public initialMass:number = 1000;
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
	
	private nodes:Array<Nodule>;
	
	private ctx:CanvasRenderingContext2D;
	
	private canvas:HTMLCanvasElement;
	
	private renderRequest:number;
	
	constructor(public container:HTMLElement) {
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'nodegarden';
		this.ctx = this.canvas.getContext("2d");
		this.container.appendChild(this.canvas);
		let n = new Nodule();
		n.x = this.scaledWidth / 2;
		n.y = this.scaledHeight / 2;
		n.m = this.criticalMass;
		n.vx = 0;
		n.vy = 0;
		this.nodes = new Array(n);
	}
	
	public init() {
		// set canvas size
		this.canvas.width = this.scaledWidth;
		this.canvas.height = this.scaledHeight;
		if (this.pixelRatio !== 1) {
			// if retina screen, scale canvas
			this.canvas.style.transform = 'scale(' + 1 / this.pixelRatio + ')';
			this.canvas.style.transformOrigin = '0 0';
		}
		if (this.renderRequest) {
			window.cancelAnimationFrame(this.renderRequest);
		}
		this.renderRequest = window.requestAnimationFrame(this.render.bind(this));
		this.canvas.addEventListener('click', this.canvas_clickHandler.bind(this));
	}
	
	private canvas_clickHandler(event:MouseEvent) {
		if (this.nodes.length === 1) {
			var r:number = this.nodes[0].radius;
			var clickBox:Box = new Box(this.nodes[0].x - r, this.nodes[0].y - r, r * 2, r * 2);
			if (clickBox.contains(event.clientX * this.pixelRatio, event.clientY * this.pixelRatio)) {
				this.explode();
			}
		}
	}
	
	private exploding:number = 0;
	
	private explode() {
		var n:Nodule, r = this.nodes[0].radius,
			rX:number, rY:number, rD:number, q:number, rQ:Point;
		while (this.nodes[0].m > this.initialMass * 2) {
			n = this.createNode();
			rD = Math.random() * r;
			rX = Math.sqrt(Math.pow(rD, 2) - Math.pow(Math.random() * rD, 2));
			rY = Math.sqrt(Math.pow(rD, 2) - Math.pow(rX, 2));
			q = Math.round(Math.random() * 3);
			rQ = {x:1,y:1};
			if (q === 0 || q === 3) rQ.x = -1;
			if (q === 2 || q === 3) rQ.y = -1; 
			n.x = this.nodes[0].x + (rX * rQ.x);
			n.y = this.nodes[0].y + (rY * rQ.y);
            n.vx = ((Math.random() * 4 - 2) * rX * rQ.x)/50;
            n.vy = ((Math.random() * 4 - 2) * rY * rQ.y)/50;
			n.m = this.initialMass;
			// console.log({rD:rD, rX: rX, rY: rY, x:n.x,y:n.y});
			if (n.m > this.nodes[0].m) {
				n.m = this.initialMass;
				this.nodes[0].m = this.initialMass;
			}
			else {
				this.nodes[0].m -= this.initialMass;
			}
			this.nodes.push(n);
		}
		// console.log("Generating", this.nodes.length, "nodes");
               this.exploding = 20;
	}
	
	private createNode(n:Nodule = null):Nodule {
		if (!n) {
			n = new Nodule(
				Math.random() * this.scaledWidth,
				Math.random() * this.scaledHeight,
                               Math.random() * 4 - 2,
                               Math.random() * 4 - 2,
				this.initialMass
			);
		} else {
			n.x = Math.random() * this.scaledWidth;
			n.y = Math.random() * this.scaledHeight;
                       n.vx = Math.random() * 4 - 2;
                       n.vy = Math.random() * 4 - 2;
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
			node:Nodule,
			vx:number,
			vy:number,
            clearCanvas:number = 0,
            rebound = true,
            slowDown = true;
		
		this.renderRequest = requestAnimationFrame(this.render.bind(this));
		
		// clear canvas
		this.ctx.fillStyle = 'rgba(0, 0, 0, ' + clearCanvas + ')';
		this.ctx.fillRect(0, 0, this.scaledWidth, this.scaledHeight);

		len = this.nodes.length;
		if (this.exploding) this.exploding--;
		for (i = 0; i < len; i++) {
			for (j = len - 1; j > -1; j--) {
				nodeA = this.nodes[i];
				nodeB = this.nodes[j];
				if (nodeA === nodeB || !nodeA || !nodeB) continue;
				// console.log({count:this.nodes.length,i:i,j:j})
			
				deltaDistance = {
					x: nodeB.x - nodeA.x,
					y: nodeB.y - nodeA.y
				}
				
				distance = Math.sqrt(Math.pow(deltaDistance.x, 2) 
								   + Math.pow(deltaDistance.y, 2));
								   
				if (this.exploding === 0 && distance < nodeA.radius + nodeB.radius) {
					// collision: remove smaller or equal
					if (nodeA.m <= nodeB.m) {
						vx = nodeA.vy * (nodeA.m / nodeB.m);
						vy = nodeA.vy * (nodeA.m / nodeB.m);
						if (nodeA.vx > 0 && nodeB.vx > 0) {
							if (nodeA.vx > nodeB.vx) {
								nodeB.vx += vx;
							}
						}
						else if (nodeA.vx < 0 && nodeB.vx < 0) {
							if (nodeA.vx < nodeB.vx) {
								nodeB.vx += vx;
							}
						}
						else {
							nodeB.vx += vx;
						}
						
						if (nodeA.vy > 0 && nodeB.vy > 0) {
							if (nodeA.vy > nodeB.vy) {
								nodeB.vy += vy;
							}
						}
						else if (nodeA.vy < 0 && nodeB.vy < 0) {
							if (nodeA.vy < nodeB.vy) {
								nodeB.vy += vy;
							}
						}
						else {
							nodeB.vy += vy;
						}
						// Combine volumes
						nodeB.m += nodeA.m;
						this.nodes.splice(i,1);
						len = this.nodes.length;
						j++;
						continue;
					}
			
					if (nodeB.m < nodeA.m) {
						vx = nodeB.vx * (nodeB.m / nodeA.m);
						vy = nodeB.vy * (nodeB.m / nodeA.m);
						if (nodeB.vx > 0 && nodeA.vx > 0) {
							if (nodeB.vx > nodeA.vx) {
								nodeA.vx += vx;
							}
						}
						else if (nodeB.vx < 0 && nodeA.vx < 0) {
							if (nodeB.vx < nodeA.vx) {
								nodeA.vx += vx;
							}
						}
						else {
							nodeA.vx += vx;
						}
						
						if (nodeB.vy > 0 && nodeA.vy > 0) {
							if (nodeB.vy > nodeA.vy) {
								nodeA.vy += vy;
							}
						}
						else if (nodeB.vy < 0 && nodeA.vy < 0) {
							if (nodeB.vy < nodeA.vy) {
								nodeA.vy += vy;
							}
						}
						else {
							nodeA.vy += vy;
						}
						
						// Combine volumes
						nodeA.m += nodeB.m;
						this.nodes.splice(j,1);
						len = this.nodes.length;
						i--;
						continue;
					}
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
				
				if (gForce * 40 >= 0.01) {
				  // draw gravity lines
				  this.ctx.beginPath();
				  this.ctx.strokeStyle = 'rgba(255,255,255,' + gForce * 40 + ')';
				  this.ctx.moveTo(nodeA.x, nodeA.y);
				  this.ctx.lineTo(nodeB.x, nodeB.y);
				  this.ctx.stroke();
				}
				
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
			this.ctx.fillStyle = 'rgba(' + (255 - Math.floor(255 * (node.m / this.criticalMass))) + ', 255, 255, 1)'; 
			this.ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
			this.ctx.fill();
		
			node.x += node.vx;
			node.y += node.vy;
			let r = node.radius;
                        
            if (node.x - r <= 0) {
                impactAngle = this.impactLoss(node.vx, node.vy, true);
                vLoss = slowDown ? 1 - impactAngle : 1;
                node.x = rebound ? r : this.scaledWidth - r;
                node.vx *= rebound?-vLoss:vLoss;
                node.vy *= vLoss;
            } else if (node.x + r >= this.scaledWidth) {
                impactAngle = this.impactLoss(node.vx, node.vy, true);
                vLoss = slowDown ? 1 - impactAngle : 1;
                node.x = rebound ? this.scaledWidth - r : r;
                node.vx *= rebound?-vLoss:vLoss;
                node.vy *= vLoss;
            }
            
            if (node.y - r <= 0) {
                impactAngle = this.impactLoss(node.vx, node.vy, false);
                vLoss = slowDown ? 1 - impactAngle : 1;
                node.y = rebound ? r : this.scaledHeight - r;
                node.vy *= rebound? -vLoss : vLoss;
                node.vx *= vLoss;
            } else if (node.y + r >= this.scaledHeight) {
                impactAngle = this.impactLoss(node.vx, node.vy, false);
                vLoss = slowDown ? 1 - impactAngle : 1;
                node.y = rebound ? this.scaledHeight - r : r;
                node.vy *= rebound ? -vLoss : vLoss;
                node.vx *= vLoss;
            }
		}
	}
	
	private impactLoss(deltaX:number, deltaY:number, isVertical:boolean):number {
		let degs = Math.abs(Math.atan(deltaY / deltaX)) * (180 / Math.PI);
  		if (isVertical) degs = 90 - degs;
  		return degs / 90;
	}
}