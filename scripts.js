// set up canvas and context
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// IT'S A LION
var lionWidth = 17;
var lionHeight = 17;
var lionX = Math.floor(Math.random() * (canvas.width - lionWidth));
var lionY = Math.floor(Math.random() * (canvas.height -lionHeight));
var lionSpd = .06;
// get random direction between -1, 0, and 1
var lionDirectionX = Math.floor(Math.random() * 3) - 1;
var lionDirectionY = Math.floor(Math.random() * 3) - 1;
var lionTimeX = 0;
var lionTimeY = 0;
var lionIntentLimit = 4;
// get random time between 1 to lionIntentLimit seconds
var lionIntentX = (Math.floor(Math.random() * lionIntentLimit) + 1) * 1000;
var lionIntentY = (Math.floor(Math.random() * lionIntentLimit) + 1) * 1000;
var lionColor = "#FDD835";

// Game loop stuff
var lastFrameTimeMs = 0; // The last time the loop was run
var maxFPS = 60;
var timestep = 1000 / maxFPS;
var delta = 0;
var fps = maxFPS;
// decay parameter - how heavily more recent seconds are weighted when calculating fps
var fpsDecay = 0.25;
var framesThisSecond = 0;
var lastFpsUpdate = 0;

function update(delta) {
  // add time to lion
  lionTimeX += delta;
  lionTimeY += delta;
  // change directions after some period of time
  if (lionTimeX > lionIntentX) {
    lionTimeX = 0;
    lionDirectionX = Math.floor(Math.random() * 3) - 1;
    lionIntentX = (Math.floor(Math.random() * lionIntentLimit) + 1) * 1000;
  }
  if (lionTimeY > lionIntentY) {
    lionTimeY = 0;
    lionDirectionY = Math.floor(Math.random() * 3) - 1;
    lionIntentY = (Math.floor(Math.random() * lionIntentLimit) + 1) * 1000;
  }
  // move the lion
  lionX += lionSpd * lionDirectionX * delta;
  lionY += lionSpd * lionDirectionY * delta;
  // if lion position is out of bounds fix position switch directions
  if (lionX >= canvas.width - lionWidth) {
    lionX = canvas.width - lionWidth - 1;
    lionDirectionX = -lionDirectionX;
  }
  else if (lionX <= 0) {
    lionX = 1;
    lionDirectionX = -lionDirectionX;
  }
  if (lionY >= canvas.height - lionHeight) {
    lionY = canvas.height - lionHeight - 1;
    lionDirectionX = -lionDirectionY;
  }
  else if (lionY <= 0) {
    lionY = 1;
    lionDirectionY = -lionDirectionY;
  }
}

function draw() {
  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw the lion
  ctx.fillStyle = lionColor;
  ctx.fillRect(lionX, lionY, lionWidth, lionHeight);
  // display fps
  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.fillText(Math.round(fps) + " fps", 0, 12);
}

function panic() {
  delta = 0;
}

function loop(timestamp) {
  // Throttle the frame rate.
  if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
      requestAnimationFrame(loop);
      return;
  }
  // Track the accumulated time that hasn't been simulated yet
  delta += timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp

  // calculate fps
  if (timestamp > lastFpsUpdate + 1000) { // update every second
    fps = fpsDecay * framesThisSecond + (1 -fpsDecay) * fps; // compute the new FPS

    lastFpsUpdate = timestamp;
    framesThisSecond = 0;
  }
  framesThisSecond++;

  var numUpdateSteps = 0;
  // Simulate the total elapsed time in fixed-size chunks
  while (delta >= timestep) {
    update(timestep);
    delta -= timestep;
    // Sanity check
    if (++numUpdateSteps >= 240) {
      panic(); // fix things
      break; // bail out
    }
  }
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);