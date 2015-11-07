var Box = (function () {
    function Box(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    Box.prototype.contains = function (x, y) {
        return this.x <= x && x <= this.x + this.w
            && this.y <= y && y <= this.y + this.h;
    };
    return Box;
})();
var Nodule = (function () {
    function Nodule(
        /**
         * x coordinate
         */
        x, 
        /**
         * y coordinate
         */
        y, 
        /**
         * velocity along the x axis
         */
        vx, 
        /**
         * velocity along the y axis
         */
        vy, m) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        if (m === void 0) { m = 0; }
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this._radius = 0;
        this._mass = 0;
        this.m = m;
    }
    Object.defineProperty(Nodule.prototype, "m", {
        get: function () {
            return this._mass;
        },
        /**
         * Initial mass
         */
        set: function (v) {
            if (v !== this._mass) {
                this._mass = v;
                this._radius = Math.pow((3 * v) / (4 * Math.PI), 1 / 3);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Nodule.prototype, "radius", {
        /**
         * Spherical mass
         */
        get: function () {
            return this._radius;
        },
        enumerable: true,
        configurable: true
    });
    return Nodule;
})();
// /Users/bscott/src/beauscott/nodegarden/scripts/nbody.ts
/// <reference path="./shared-components.ts"/>
var NBodyController = (function () {
    function NBodyController(container) {
        this.container = container;
        this.G = 6.67408e-4; // Real gravitational constant = 6.67408e-11, too weak...
        this.initialMass = 10;
        this.criticalMass = 10000;
        this.exploding = 0;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'nodegarden';
        this.ctx = this.canvas.getContext("2d");
        this.container.appendChild(this.canvas);
        var n = new Nodule();
        n.x = this.scaledWidth / 2;
        n.y = this.scaledHeight / 2;
        n.m = this.criticalMass;
        n.vx = 0;
        n.vy = 0;
        this.nodes = new Array(n);
    }
    Object.defineProperty(NBodyController.prototype, "windowArea", {
        get: function () {
            return this.windowWidth * this.windowHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NBodyController.prototype, "pixelRatio", {
        get: function () {
            return window.devicePixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NBodyController.prototype, "windowWidth", {
        get: function () {
            return window.innerWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NBodyController.prototype, "windowHeight", {
        get: function () {
            return window.innerHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NBodyController.prototype, "scaledHeight", {
        get: function () {
            return this.windowHeight * this.pixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NBodyController.prototype, "scaledWidth", {
        get: function () {
            return this.windowWidth * this.pixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    NBodyController.prototype.init = function () {
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
    };
    NBodyController.prototype.canvas_clickHandler = function (event) {
        if (this.nodes.length === 1) {
            var r = this.nodes[0].radius;
            var clickBox = new Box(this.nodes[0].x - r, this.nodes[0].y - r, r * 2, r * 2);
            if (clickBox.contains(event.clientX * this.pixelRatio, event.clientY * this.pixelRatio)) {
                this.explode();
            }
        }
    };
    NBodyController.prototype.explode = function () {
        var n, r = this.nodes[0].radius, rX, rY, rD, q, rQ;
        while (this.nodes[0].m > this.initialMass * 2) {
            n = this.createNode();
            rD = Math.random() * r;
            rX = Math.sqrt(Math.pow(rD, 2) - Math.pow(Math.random() * rD, 2));
            rY = Math.sqrt(Math.pow(rD, 2) - Math.pow(rX, 2));
            q = Math.round(Math.random() * 3);
            rQ = { x: 1, y: 1 };
            if (q === 0 || q === 3)
                rQ.x = -1;
            if (q === 2 || q === 3)
                rQ.y = -1;
            n.x = this.nodes[0].x + (rX * rQ.x);
            n.y = this.nodes[0].y + (rY * rQ.y);
            n.vx = (rX * rQ.x);
            n.vy = (rY * rQ.y);
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
        this.exploding = 500;
    };
    NBodyController.prototype.createNode = function (n) {
        if (n === void 0) { n = null; }
        if (!n) {
            n = new Nodule(Math.random() * this.scaledWidth, Math.random() * this.scaledHeight, Math.random() * 1 - 0.5, Math.random() * 1 - 0.5, this.initialMass);
        }
        else {
            n.x = Math.random() * this.scaledWidth;
            n.y = Math.random() * this.scaledHeight;
            n.vx = Math.random() * 1 - 0.5;
            n.vy = Math.random() * 1 - 0.5;
            n.m = this.initialMass;
        }
        return n;
    };
    NBodyController.prototype.render = function () {
        var distance, impactAngle, vLoss, direction, gForce, force, deltaDistance, i, j, len, nodeA, nodeB, node, vx, vy;
        this.renderRequest = requestAnimationFrame(this.render.bind(this));
        // clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.scaledWidth, this.scaledHeight);
        len = this.nodes.length;
        if (this.exploding)
            this.exploding--;
        for (i = 0; i < len; i++) {
            for (j = len - 1; j > -1; j--) {
                nodeA = this.nodes[i];
                nodeB = this.nodes[j];
                if (nodeA === nodeB || !nodeA || !nodeB)
                    continue;
                // console.log({count:this.nodes.length,i:i,j:j})
                deltaDistance = {
                    x: nodeB.x - nodeA.x,
                    y: nodeB.y - nodeA.y
                };
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
                        this.nodes.splice(i, 1);
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
                        this.nodes.splice(j, 1);
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
            this.ctx.fillStyle = 'rgba(' + (255 - Math.floor(255 * (node.m / this.criticalMass))) + ', 255, 255, 1)';
            this.ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
            this.ctx.fill();
            node.x += node.vx;
            node.y += node.vy;
            var r = node.radius;
            if (node.x - r <= 0) {
                impactAngle = this.impactLoss(node.vx, node.vy, true);
                vLoss = 1 - impactAngle;
                node.x = r;
                node.vx *= -vLoss;
                node.vy *= vLoss;
                node.y += node.vy;
            }
            else if (node.x + r >= this.scaledWidth) {
                impactAngle = this.impactLoss(node.vx, node.vy, true);
                vLoss = 1 - impactAngle;
                node.x = this.scaledWidth - r;
                node.vx *= -vLoss;
                node.vy *= vLoss;
                node.y += node.vy;
            }
            if (node.y - r <= 0) {
                impactAngle = this.impactLoss(node.vx, node.vy, false);
                vLoss = 1 - impactAngle;
                node.y = r;
                node.vy *= -vLoss;
                node.vx *= vLoss;
                node.x += node.vx;
            }
            else if (node.y + r >= this.scaledHeight) {
                impactAngle = this.impactLoss(node.vx, node.vy, false);
                vLoss = 1 - impactAngle;
                node.y = this.scaledHeight - r;
                node.vy *= -vLoss;
                node.vx *= vLoss;
                node.x += node.vx;
            }
        }
    };
    NBodyController.prototype.impactLoss = function (deltaX, deltaY, isVertical) {
        var degs = Math.abs(Math.atan(deltaY / deltaX)) * (180 / Math.PI);
        if (isVertical)
            degs = 90 - degs;
        return degs / 90;
    };
    return NBodyController;
})();
function NBodyController_main() {
    var container = document.getElementById('container'), sc = new NBodyController(container);
    sc.init();
    window.addEventListener('resize', sc.init.bind(sc));
}
