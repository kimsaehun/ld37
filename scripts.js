// set up canvas and context
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// miscellaneous stuff
function Coord(x, y) {
  this.x = x;
  this.y = y;
}

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

// Just some cage stuff
var cageStatus = false;
var cageBorderLength = 53;
var cageWidth = cageBorderLength;
var cageHeight = cageBorderLength;
var cageX = 100;
var cageY = 100;
var cageColor = "black";
var cageBuildStage = -1;
var cageCorners = [new Coord(100, 100), new Coord(100,153), new Coord(153,153), new Coord(153,100)];
var cageBuildStatus = 1;
// cage builder
var cageBuilderSpd = 0.16;
var cageBuilderCoord = new Coord(undefined, undefined);
var buildDirection = (Math.random() * 2) > 1 ? 1 : -1;
var current = Math.floor(Math.random() * 4);
var next = (current + 1) % 4;
var currentBorderLength = 0;
var builtCorners = [];

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
  // cage test
  if (cageBuildStatus == 1) {
    if (cageBuildStage == -1) {
      current = Math.floor(Math.random() * 4);
      buildDirection = (Math.random() * 2) > 1 ? 1 : -1;
      next = (current + (buildDirection * 1)) % 4;
      if (next < 0) { next = 4 + next; }
      builtCorners.push(cageCorners[current]);
      cageBuilderCoord.x = builtCorners[0].x;
      cageBuilderCoord.y = builtCorners[0].y;
      cageBuildStage++;
    }
    else if (cageBuildStage < 4) {
      // get cage builder's new coordinants
      // determine which way to go
      if (cageCorners[current].x == cageCorners[next].x) {
        // moving vertically
        if (cageCorners[current].y < cageCorners[next].y) {
          // we need to move down
          cageBuilderCoord.y += cageBuilderSpd * delta;
        }
        else if (cageCorners[current].y > cageCorners[next].y) {
          // we need to move up
          cageBuilderCoord.y -= cageBuilderSpd * delta;
        }
        // track the width of the border being built
        currentBorderLength += cageBuilderSpd * delta;
      }
      else if (cageCorners[current].y == cageCorners[next].y){
        // moving horizontally
        if (cageCorners[current].x < cageCorners[next].x) {
          // we need to move right
          cageBuilderCoord.x += cageBuilderSpd * delta;
        }
        else if (cageCorners[current].x > cageCorners[next].x) {
          // we need to move left
          cageBuilderCoord.x -= cageBuilderSpd * delta;
        }
        // track the width of the border being built
        currentBorderLength += cageBuilderSpd * delta;
      }
      else {
        console.log("Not sure what this would mean.");
      }

      // check if the next corner has been reached
      if (currentBorderLength > cageBorderLength) {
        currentBorderLength = 0;
        cageBuilderCoord.x = cageCorners[next].x;
        cageBuilderCoord.y = cageCorners[next].y;
        builtCorners.push(cageCorners[next]);
        current = next;
        next = (current + (buildDirection * 1)) % 4;
        if (next < 0) { next = 4 + next; }
        cageBuildStage++;
      }
    }
    else {
      cageBuildStatus = 0;
    }
  }
}

function draw() {
  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw the lion
  ctx.fillStyle = lionColor;
  ctx.fillRect(lionX, lionY, lionWidth, lionHeight);
  // cage drawing test
  ctx.beginPath();
  ctx.strokeStyle = cageColor;
  ctx.moveTo(builtCorners[0].x, builtCorners[0].y);
  for (var i = 0; i < builtCorners.length; i++) {
    ctx.lineTo(builtCorners[i].x, builtCorners[i].y);
  }
  ctx.lineTo(cageBuilderCoord.x, cageBuilderCoord.y);
  ctx.stroke();
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