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
// /Users/bscott/src/beauscott/nodegarden/scripts/main.ts
/// <reference path="./shared-components.ts"/>
var SpaceController = (function () {
    function SpaceController(container) {
        this.container = container;
        this.G = 6.67408e-3;
        this.initialMass = 10;
        this.criticalMass = 10000;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'nodegarden';
        this.ctx = this.canvas.getContext("2d");
        this.container.appendChild(this.canvas);
        this.nodes = new Array(this.nodeCount);
    }
    Object.defineProperty(SpaceController.prototype, "windowArea", {
        get: function () {
            return this.windowWidth * this.windowHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceController.prototype, "pixelRatio", {
        get: function () {
            return window.devicePixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceController.prototype, "windowWidth", {
        get: function () {
            return window.innerWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceController.prototype, "windowHeight", {
        get: function () {
            return window.innerHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceController.prototype, "scaledHeight", {
        get: function () {
            return this.windowHeight * this.pixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceController.prototype, "scaledWidth", {
        get: function () {
            return this.windowWidth * this.pixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceController.prototype, "nodeCount", {
        get: function () {
            return Math.sqrt((this.scaledHeight * this.scaledWidth) / 72) / this.pixelRatio | 0;
        },
        enumerable: true,
        configurable: true
    });
    SpaceController.prototype.init = function () {
        // create nodes
        var i, len;
        // set canvas size
        this.canvas.width = this.scaledWidth;
        this.canvas.height = this.scaledHeight;
        this.nodes.length = this.nodeCount;
        console.log({ nodes: this.nodeCount, pxr: this.pixelRatio });
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
    };
    SpaceController.prototype.createNode = function (n) {
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
    SpaceController.prototype.render = function () {
        var distance, impactAngle, vLoss, direction, gForce, force, deltaDistance, i, j, len, nodeA, nodeB, node;
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
                };
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
                        if (nodeB.m > this.criticalMass)
                            nodeB.m = this.initialMass;
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
                        if (nodeA.m > this.criticalMass)
                            nodeA.m = this.initialMass;
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
            }
            else if (node.x >= this.scaledWidth) {
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
            }
            else if (node.y >= this.scaledHeight) {
                impactAngle = this.impactLoss(node.vx, node.vy, false);
                vLoss = 1 - (0.5 * impactAngle);
                node.y = this.scaledHeight;
                node.vy *= -vLoss;
                node.vx *= vLoss;
                node.x += node.vx;
            }
        }
    };
    SpaceController.prototype.impactLoss = function (deltaX, deltaY, isVertical) {
        var degs = Math.abs(Math.atan(deltaY / deltaX)) * (180 / Math.PI);
        if (isVertical)
            degs = 90 - degs;
        return degs / 90;
    };
    return SpaceController;
})();
