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
// /Users/bscott/src/beauscott/nodegarden/scripts/orbiter.ts
/// <reference path="shared-components.ts" />
var SpaceObject = (function () {
    function SpaceObject(
        /**
        * Name of object
        */
        name, 
        /**
        * Velocity in km/s
        */
        velocity, 
        /**
        * Distance from center in km
        */
        distance, fillStyle, 
        /**
        * Mass in kg
        */
        mass, 
        /**
        * Density in kg/m^3
        */
        density, exaggeration) {
        if (exaggeration === void 0) { exaggeration = 1; }
        this.name = name;
        this.velocity = velocity;
        this.distance = distance;
        this.fillStyle = fillStyle;
        this.exaggeration = exaggeration;
        this._mass = 0;
        this._density = 1;
        this._radius = 0;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.mass = mass;
        this.density = density;
    }
    Object.defineProperty(SpaceObject.prototype, "mass", {
        get: function () {
            return this._mass;
        },
        /**
         * Mass in kg
         */
        set: function (v) {
            if (v !== this._mass) {
                this._mass = v;
                this.measure();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceObject.prototype, "density", {
        get: function () {
            return this._density;
        },
        /**
         * Density in kg/m^3
         */
        set: function (v) {
            if (v !== this._mass) {
                this._density = v;
                this.measure();
            }
        },
        enumerable: true,
        configurable: true
    });
    SpaceObject.prototype.measure = function () {
        var v = this._mass / this._density;
        this._radius = Math.pow((3 * v) / (4 * Math.PI), 1 / 3) / 1000;
    };
    Object.defineProperty(SpaceObject.prototype, "radius", {
        /**
         * Spherical mass
         */
        get: function () {
            return this._radius;
        },
        enumerable: true,
        configurable: true
    });
    return SpaceObject;
})();
var OrbitalController = (function () {
    function OrbitalController(container, solarSystem) {
        this.container = container;
        this.G = 6.67408e-11;
        this.scale = 1;
        this.initial = true;
        this.tick = 0;
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
    Object.defineProperty(OrbitalController.prototype, "windowArea", {
        get: function () {
            return this.windowWidth * this.windowHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrbitalController.prototype, "pixelRatio", {
        get: function () {
            return window.devicePixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrbitalController.prototype, "windowWidth", {
        get: function () {
            return window.innerWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrbitalController.prototype, "windowHeight", {
        get: function () {
            return window.innerHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrbitalController.prototype, "scaledHeight", {
        get: function () {
            return this.windowHeight * this.pixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrbitalController.prototype, "scaledWidth", {
        get: function () {
            return this.windowWidth * this.pixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    OrbitalController.prototype.init = function () {
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
    };
    OrbitalController.prototype.render = function () {
        var t = new Date().getTime();
        this.tick = t - this.lastTick;
        this.lastTick = t;
        // this.renderRequest = window.requestAnimationFrame(this.render.bind(this));
        this.renderRequest = setTimeout(this.render.bind(this), 1000);
        this.calculateSystemScale();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.scaledWidth, this.scaledHeight);
        this.solarSystem.forEach(this.draw.bind(this));
        this.initial = false;
    };
    OrbitalController.prototype.calculateSystemScale = function () {
        var i, max = 0, so;
        for (i = 0; i < this.solarSystem.length; i++) {
            so = this.solarSystem[i];
            max = Math.max(2 * (so.distance + so.radius), max);
        }
        this.scale = Math.min(this.scaledHeight, this.scaledWidth) / max;
    };
    OrbitalController.prototype.draw = function (planet) {
        var deltaDistance, distance, direction, gForce, force;
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
            console.log({ scale: this.scale, force: force, vx: planet.vx, vy: planet.vy, x: planet.x, y: planet.y });
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
    };
    return OrbitalController;
})();
