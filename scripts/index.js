
var pixelRatio = window.devicePixelRatio
var wWidth
var wHeight
var wArea

var nodes = new Array(Math.sqrt(wArea) / 10 | 0)

var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')

var $container = document.getElementById('container')

if (pixelRatio !== 1) {
  // if retina screen, scale canvas
  canvas.style.transform = 'scale(' + 1 / pixelRatio + ')'
  canvas.style.transformOrigin = '0 0'
}
canvas.id = 'nodegarden'

$container.appendChild(canvas)

init()
render()

window.addEventListener('resize', init)

function init () {
  wWidth = window.innerWidth * pixelRatio
  wHeight = window.innerHeight * pixelRatio
  wArea = wWidth * wHeight

  // calculate nodes needed
  nodes.length = Math.sqrt(wArea / 72) | 0

  // set canvas size
  canvas.width = wWidth
  canvas.height = wHeight

  // create nodes
  var i, len
  for (i = 0, len = nodes.length; i < len; i++) {
    if (nodes[i]) {
      continue
    }
    nodes[i] = {
      x: Math.random() * wWidth,
      y: Math.random() * wHeight,
      vx: Math.random() * 1 - 0.5,
      vy: Math.random() * 1 - 0.5,
      m: 10
    }
  }
}

function render () {
  var distance
  var direction
  var force
  var xForce, yForce
  var xDistance, yDistance, maxDistance
  var i, j, nodeA, nodeB, node, len, radA, radB, impactAngle, vLoss

  // request new animationFrame
  requestAnimationFrame(render)

  // clear canvas
  ctx.clearRect(0, 0, wWidth, wHeight)
  
  // update links
  for (i = 0, len = nodes.length - 1; i < len; i++) {
    for (j = i + 1; j < len + 1; j++) {
      nodeA = nodes[i]
      nodeB = nodes[j]
      radA = Math.pow((3 * nodeA.m) / (4 * Math.PI), 1/3)
      radB = Math.pow((3 * nodeB.m) / (4 * Math.PI), 1/3)
      xDistance = nodeB.x - nodeA.x
      yDistance = nodeB.y - nodeA.y

      // calculate distance
      distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
      
      if (distance < radA + radB) {
        // collision: remove smaller or equal
        if (nodeA.m <= nodeB.m) {
          nodeA.x = Math.random() * wWidth
          nodeA.y = Math.random() * wHeight
          
          nodeB.vx += nodeA.vx * (nodeA.m / nodeB.m)
          nodeB.vy += nodeA.vy * (nodeA.m / nodeB.m)
          
          nodeA.vx = Math.random() * 1 - 0.5
          nodeA.vy = Math.random() * 1 - 0.5
          
          // Combine volumes
          nodeB.m += nodeA.m
          console.log("Annihilation A->B", nodeB.m);
          radB = Math.pow((3 * nodeB.m) / (4 * Math.PI), 1/3)
          nodeA.m = 10
        }

        if (nodeB.m <= nodeA.m) {
          nodeB.x = Math.random() * wWidth
          nodeB.y = Math.random() * wHeight
          
          nodeA.vx += nodeB.vx * (nodeB.m / nodeA.m)
          nodeA.vy += nodeB.vy * (nodeB.m / nodeA.m)
          
          nodeB.vx = Math.random() * 1 - 0.5
          nodeB.vy = Math.random() * 1 - 0.5
          // Combine volumes
          nodeA.m += nodeB.m
          radA = Math.pow((3 * nodeA.m) / (4 * Math.PI), 1/3)
          console.log("Annihilation B->A", nodeA.m);
          nodeB.m = 10
        }
        continue
      }
      
      maxDistance = radA * 5 + radB * 5
      if (distance > maxDistance) {
        continue
      }

      // calculate gravity direction
      direction = {
        x: xDistance / distance,
        y: yDistance / distance
      }

      // calculate gravity force
      force = (nodeA.m * nodeB.m) / Math.pow(distance, 2)

      if (force > 0.025) {
        // cap force to a maximum value of 0.025
        force = 0.025
      }

      // draw gravity lines
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0,0,255,' + force * 40 + ')'
      ctx.moveTo(nodeA.x, nodeA.y)
      ctx.lineTo(nodeB.x, nodeB.y)
      ctx.stroke()

      xForce = force * direction.x
      yForce = force * direction.y

      // calculate new velocity after gravity
      nodeA.vx += (nodeB.m / nodeA.m) * xForce
      nodeA.vy += (nodeB.m / nodeA.m) * yForce
      nodeB.vx -= (nodeA.m / nodeB.m) * xForce
      nodeB.vy -= (nodeA.m / nodeB.m) * yForce
    }
  }
  // update nodes
  for (i = 0, len = nodes.length; i < len; i++) {
    node = nodes[i]
    ctx.beginPath()
    // treat as spheres
    ctx.fillStyle = 'rgba(' + Math.min(255, node.m / 10) + ', 0, 0, 1)' 
    ctx.arc(node.x, node.y, Math.pow((3 * node.m) / (4 * Math.PI), 1 / 3), 0, 2 * Math.PI)
    ctx.fill()

    node.x += node.vx
    node.y += node.vy
    
    if (node.x <= 0) {
      impactAngle = impactLoss(node.vx, node.vy, true);
      vLoss = 1 - (0.5 * impactAngle);
      node.x = 0
      node.vx *= -vLoss
      node.vy *= vLoss
      node.y += node.vy
      
    } else if (node.x >= wWidth) {
      impactAngle = impactLoss(node.vx, node.vy, true);
      vLoss = 1 - (0.5 * impactAngle);
      node.x = wWidth
      node.vx *= -vLoss
      node.vy *= vLoss
      node.y += node.vy
    }
    
    if (node.y <= 0) {
      impactAngle = impactLoss(node.vx, node.vy, false);
      vLoss = 1 - (0.5 * impactAngle);
      node.y = 0
      node.vy *= -vLoss
      node.vx *= vLoss
      node.x += node.vx
    } else if (node.y >= wHeight) {
      impactAngle = impactLoss(node.vx, node.vy, false);
      vLoss = 1 - (0.5 * impactAngle);
      node.y = wHeight
      node.vy *= -vLoss
      node.vx *= vLoss
      node.x += node.vx
    }
  }
}

function impactLoss(dX, dY, vertical) {
  var degs = Math.abs(Math.atan(dY / dX)) * (180 / Math.PI)
  if (vertical) degs = 90 - degs
  return degs / 90
}
