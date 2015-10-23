# HTML5 Node Garden

https://beau6183.github.io/nodegarden

Really simple node garden made with HTML5 (based on https://pakastin.github.io/nodegarden). I've made the following changes.

- More nodes!
- Walls now rebound nodes (with momentum loss based on impact angle)
- Node color intensifies as it reaches critical
- When two nodes collide, the mass of the smaller one is transfered to the larger one, and the larger's trajectory is altered. The inhillated node resets and respawns randomly
- Force lines are removed, motion blur added
- Uses a more-realistic gravity, though still stronger than real gravity, using 0.6e-3 as G, rather than 1
- Nodes now affect eachother with mass-proportional force as they pass near by.
- Nodes are rendered based on a spherical circumfrence using their mass with a volume of 1
