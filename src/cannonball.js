"use strict";

// cannonball construct
function Cannonball(canvas, shipPositionX, shipPositionY) {
  this.canvas = canvas;
  this.ctx = this.canvas.getContext("2d");

  this.size = 25;
  this.x = shipPositionX;
  this.y = shipPositionY;
  this.speed = 5;
}

// cannonball draw when keydown is pressed
Cannonball.prototype.draw = function() {
  this.ctx.fillStyle = "blue";

  // fillRect(x, y, width, height)
  this.ctx.fillRect(this.x, this.y, this.size, this.size);
};

// cannonball automatic movement
Cannonball.prototype.move = function() {
  this.y = this.y - this.speed;
};

// to check collision between a cannonball and a tentacle
Cannonball.prototype.cannonballHit = function(tentacle) {
  // variables for easier reading
  var cannonballLeft = this.x;
  var cannonballRight = this.x + this.size;
  var cannonballTop = this.y;
  var cannonballBottom = this.y + this.size;

  // variables for easier reading
  var tentacleLeft = tentacle.x;
  var tentacleRight = tentacle.x + tentacle.width;
  var tentacleTop = tentacle.y;
  var tentacleBottom = tentacle.y + tentacle.height;

  // checks in variables for easier reading
  var crossRight =
    tentacleLeft <= cannonballRight && tentacleRight >= cannonballLeft;
  var crossLeft =
    tentacleRight >= cannonballLeft && tentacleLeft <= cannonballRight;
  var crossTop =
    tentacleBottom >= cannonballTop && tentacleTop <= cannonballBottom;
  var crossBottom =
    tentacleBottom <= cannonballBottom && tentacleBottom >= cannonballTop;

  // collision check
  if ((crossLeft || crossRight) && (crossTop || crossBottom)) {
    return true;
  }

  return false;
};
