// Margin to account for when drawing the grid. Grid unit length.
C.gridMargin = 1.05;
// A constant used in converting grid twist into grid units, or some such. :S
C.gridTwistFactor = 1 / 32;
// The starting distance of the grid as we fly in.
C.flyInStart = 2 * C.depth;
// The Z-distance to advance the grid per frame.
C.flyInAdvance = 8;

// Just a fancy container.
var Grids = {};

var Grid = function(info) {
  // Store some things
  this.wraps = info.wraps;
  this.angles = info.angles;
  this.twist = [info.twist[0] * C.gridTwistFactor, info.twist[1] * C.gridTwistFactor];

  // Calculate the coordinates.
  var coords = [],
      angle = 0, x = 0, y = 0, i, radians, // State
      xmin = 0, xmax = 0, ymin = 0, ymax = 0; // Used to keep track of boundaries.
  coords[this.angles.length] = null; // initialize array size
  for (i = 0; i < this.angles.length; i++) {
    // Store current position
    coords[i] = [x, y];

    // Keep track of the boundaries.
    xmin = Math.min(x, xmin); xmax = Math.max(x, xmax);
    ymin = Math.min(y, ymin); ymax = Math.max(y, ymax);

    // Iterate
    angle += this.angles[i];
    radians = angle * C.radPerDeg;
    x += Math.cos(radians); y -= Math.sin(radians);
  }
  // Close the grid, or add the final lane.
  if (this.wraps) {
    // -1 signifies a closing segment, used in #draw
    coords[i] = coords[0].concat([-1]);
  }
  else {
    coords[i] = [x, y];
    xmin = Math.min(x, xmin); xmax = Math.max(x, xmax);
    ymin = Math.min(y, ymin); ymax = Math.max(y, ymax);
  }

  // Add margins to the boundaries.
  xmin -= C.gridMargin; xmax += C.gridMargin;
  ymin -= C.gridMargin; ymax += C.gridMargin;

  // Account for twist, by twisting the boundaries we just calculated as if they were at the back
  // of the grid. Then maximimze between our original and these new boundaries.
  var factor = C.startDepth / C.endDepth;
  xmin = Math.min(xmin, (xmin - this.twist[0]) * factor + this.twist[0]);
  xmax = Math.max(xmax, (xmax - this.twist[0]) * factor + this.twist[0]);
  ymin = Math.min(ymin, (ymin - this.twist[1]) * factor + this.twist[1]);
  ymax = Math.max(ymax, (ymax - this.twist[1]) * factor + this.twist[1]);

  // Calculate the total size, including margins.
  this.size = [xmax - xmin, ymax - ymin];

  // Translate all coordinates, so the origin becomes the center of the drawing.
  var translation = [-(xmin + xmax) / 2, -(ymin + ymax) / 2];
  for (i = 0; i < coords.length; i++) {
    coords[i][0] += translation[0];
    coords[i][1] += translation[1];
  }

  // Store coordinates.
  this.coords = coords;
};

Grid.prototype = {
  color: [255,255,255],
  distance: 0
};

Grid.prototype.draw = function() {
  // Calculate screen coordinates for each grid corner.
  // We simulate the Z-axis by reversing the below twist translation with a factor.
  // Pretty simply, this 'pulls stuff away' from the point of convergence.
  var frontDepthFactor = C.startDepth / (C.startDepth + this.distance),
      backDepthFactor = C.startDepth / (C.endDepth + this.distance),
      scoords = [], i;
  scoords[this.coords.length - 1] = null; // initialize array size
  for (i = 0; i < this.coords.length; i++) {
    var corner = this.coords[i];
    scoords[i] = {
      sx: (corner[0] - this.twist[0]) * frontDepthFactor,
      sy: (corner[1] - this.twist[1]) * frontDepthFactor,
      ex: (corner[0] - this.twist[0]) * backDepthFactor,
      ey: (corner[1] - this.twist[1]) * backDepthFactor,
      close: (corner[2] === -1)
    };
  }

  var style = 'rgb('+this.color[0]+','+this.color[1]+','+this.color[2]+')', alphaFactor;
  if (this.distance < C.fogDepth) {
    alphaFactor = 1.0;
  }
  else {
    alphaFactor = Math.max(0, 1 - (this.distance-C.startDepth) / (C.flyInStart-C.startDepth-1));
  }

  c.save();
  // Translate to the center of the screen.
  c.translate(frame.w / 2, frame.h / 2);
  // Scale to fit the grid neatly on the screen.
  var scale = Math.min(frame.w / this.size[0], frame.h / this.size[1]);
  c.scale(scale, scale);
  // Translate with the grid twist, so that the origin becomes the point of convergence.
  c.translate(this.twist[0], this.twist[1]);

  // Fill the grid area
  c.beginPath();
  c.moveTo(scoords[0].sx, scoords[0].sy);
  for (i = 1; i < scoords.length; i++) {
    var corner = scoords[i];
    c.lineTo(corner.sx, corner.sy);
  }
  for (i -= 1; i >= 0; i -= 1) {
    var corner = scoords[i];
    c.lineTo(corner.ex, corner.ey);
  }
  c.closePath();

  c.globalAlpha = 0.03 * alphaFactor;
  c.fillStyle = style;
  c.fill();

  c.beginPath();
  // Draw lanes
  for (i = 0; i < scoords.length; i++) {
    var corner = scoords[i];
    c.moveTo(corner.sx, corner.sy);
    c.lineTo(corner.ex, corner.ey);
  }
  // Draw front edge
  c.moveTo(scoords[0].sx, scoords[0].sy);
  for (i = 1; i < scoords.length; i++) {
    var corner = scoords[i];
    if (corner.close) { c.closePath(); break; }
    c.lineTo(corner.sx, corner.sy);
  }
  // Draw back edge
  c.moveTo(scoords[0].ex, scoords[0].ey);
  for (i = 1; i < scoords.length; i++) {
    var corner = scoords[i];
    if (corner.close) { c.closePath(); break; }
    c.lineTo(corner.ex, corner.ey);
  }

  c.restore();

  c.globalAlpha = alphaFactor;
  c.lineWidth = 1;
  c.strokeStyle = style;
  c.stroke();
};


// Grid definitions follow. The lanes are all homogeneous in width, so all that has to be stored
// for a grid are the +angles+ between lanes. The first angle is a starting angle, where 0 means
// rightwards on the screen. Angles are then specified in counter-clockwise fashion. All angles
// are in degrees.

// +wraps+ is a boolean, whether the grid wraps around. The final angle should be next-to-last
// corner if true, and be carefully tuned not to cause a wider or narrower lane, of course.

// +twist+ is used to apply an offset to the back plane of the grid, and is specified as [x,y].
// This effectively rotates the level slightly around the [y,x] axes (or [yaw,pitch] if you will).
// The unit of this looks like it was meant to be degrees, but treat it as somewhat arbitrary.

Grids.Circle16 = new Grid({ wraps: true, twist: [0,45], angles: [
  165, -21, -21, -21, -27, -21, -21, -21, -27, -21, -21, -21, -27, -21, -21, -21
]});

Grids.Square16 = new Grid({ wraps: true, twist: [0,0], angles: [
  90, 0, 0, 0, 270, 0, 0, 0, -90, 0, 0, 0, -90, 0, 0, 0
]});

Grids.Plus16 = new Grid({ wraps: true, twist: [0,30], angles: [
  270, -90, 0, -90, 90, -90, 0, -90, 90, -90, 0, -90, 90, -90, 0, -90
]});

Grids.Peanut16 = new Grid({ wraps: true, twist: [0,20], angles: [
  168, -33, -45, -45, -33, -39, 27, 27, -39, -33, -45, -45, -33, -39, 27, 27
]});

Grids.RoundedPlus16 = new Grid({ wraps: true, twist: [0,0], angles: [
  0, -69, 24, 21, -66, -69, 24, 24, -69, 291, 24, 24, -69, -69, 24, 24
]});

Grids.Triangle15 = new Grid({ wraps: true, twist: [0,0], angles: [
  180, 0, 0, 0, 0, -120, 0, 0, 0, 0, -120, 0, 0, 0, 0
]});

Grids.X16 = new Grid({ wraps: true, twist: [0,0], angles: [
  63, -57, -90, -60, 108, -60, -90, -57, 126, -57, -90, -60, 108, 300, -90, -57
]});

Grids.V15 = new Grid({ wraps: false, twist: [0,-100], angles: [
  246, 0, 0, 0, 0, 0, 0, -66, -66, 0, 0, 0, 0, 0, 0
]});

Grids.Stairs15 = new Grid({ wraps: false, twist: [0,-100], angles: [
  270, 270, 90, 270, 90, 270, 90, 270, 270, 90, 270, 90, 270, 90, 270
]});

Grids.U16 = new Grid({ wraps: false, twist: [0,0], angles: [
  270, 0, 0, 0, -15, -21, -21, -21, -24, -21, -24, -24, -9, 0, 0, 0
]});

Grids.Flat16 = new Grid({ wraps: false, twist: [0,-128], angles: [
  180, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]});

Grids.CircleCut16 = new Grid({ wraps: true, twist: [0,45], angles: [
  165, -21, -27, -27, -27, -51, -66, -24, 156, -24, -69, -48, -27, -27, -30, -18
]});

Grids.Starburst16 = new Grid({ wraps: true, twist: [0,30], angles: [
  255, -105, 60, -105, 60, -105, 60, -105, 60, -105, 60, -105, 60, -105, 60, -105
]});

Grids.W15 = new Grid({ wraps: false, twist: [0,-128], angles: [
  225, 30, 6, -33, -48, -48, -30, 78, 75, -27, -48, -48, -33, 3, 27
]});

Grids.CrookedV16 = new Grid({ wraps: false, twist: [0,-50], angles: [
  -102, 0, -6, -72, 72, 12, -21, -69, 51, -87, -21, -6, -6, 3, 6, 6
]});

Grids.Eight16 = new Grid({ wraps: true, twist: [2,2], angles: [
  237, -39, -39, -42, -57, -45, -36, -39, 3, 39, 39, 39, 60, 42, 39, 39
]});

Grids.Grid200 = new Grid({ wraps: true, twist: [0,0], angles: [
  207, 0, 315, 315, 0, 270, 0, 315, 315, 0, 36, 0, 45, 45, 0, 90, 0, 45, 45, 0
]});

Grids.Grid100 = new Grid({ wraps: false, twist: [0,45], angles: [
  180, -18, -18, -18, -18, -18, -18, -18, -18, -18,
  -18, -18, -18, -18, -18, -18, -18, -18, -18, -18
]});

Grids.Grid101 = new Grid({ wraps: true, twist: [0,0], angles: [
  90, 0, 0, 0, 270, 0, 0, 0, 0, 270, 0, 0, 0, 0, 270, 0, 0, 0, 0, 270
]});

Grids.Grid102 = new Grid({ wraps: true, twist: [0,20], angles: [
  168, -33, -45, -45, -33, -39, 27, 27, -39, -33, -45, -45, -33, -39, 27, 27
]});

Grids.Grid103 = new Grid({ wraps: false, twist: [0,-100], angles: [
  234, 0, 0, 0, 0, 0, 0, 246, 0, 0, 0, 0, 0, 0
]});

Grids.Grid104 = new Grid({ wraps: false, twist: [0,-100], angles: [
  270, 270, 90, 270, 90, 270, 90, 270, 270, 90, 270, 90, 270, 90, 270
]});

Grids.Grid105 = new Grid({ wraps: true, twist: [0,0], angles: [
  135, 0, 270, 270, 0, 90, 0, 270, 270, 0, 90, 0, 270, 270, 0, 90, 0, 270, 270, 0
]});

Grids.Grid106 = new Grid({ wraps: true, twist: [-10,-10], angles: [
  90, 0, 0, 270, 0, 270, 90, 90, 270, 0, 270, 0, 0, 270, 0, 270, 90, 90, 270, 0
]});

Grids.Grid107 = new Grid({ wraps: true, twist: [0,0], angles: [
  135, 0, 0, 270, 0, 0, 270, 18, 54, 18, 270, 0, 0, 270, 0, 0, 270, 18, 54, 18
]});

Grids.Grid108 = new Grid({ wraps: true, twist: [0,0], angles: [
  90, 270, 90, 270, 0, 270, 90, 270, 90, 270, 0, 270,
  90, 270, 90, 270, 0, 270, 90, 270, 90, 270, 0, 270
]});

Grids.Grid109 = new Grid({ wraps: true, twist: [0,45], angles: [
  180, -72, 36, -72, 36, -72, 36, -72, 36, -72, 36, -72, 36, -72, 36, -72, 36, -72, 36, -72
]});

Grids.Grid110 = new Grid({ wraps: true, twist: [0,0], angles: [
  78, 0, 270, 0, 0, 270, 0, 0, 270, 0, 0, 270, 45, 0, 0, 90, 0, 0, 90, 0, 0, 90, 0, 0
]});

Grids.Grid111 = new Grid({ wraps: true, twist: [0,0], angles: [
  144, 0, 66, 0, 204, 0, 66, 0, 204, 0, 66, 0, 204, 0, 66, 0, 114, 66, 204, 66, 204, 66, 204, 66
]});

Grids.Grid112 = new Grid({ wraps: true, twist: [0,0], angles: [
  45, 0, 270, 270, 0, 45, 45, 0, 270, 270, 0, 45, 45, 0, 270, 270, 0, 45, 45, 0, 270, 270, 0, 45
]});

Grids.Grid113 = new Grid({ wraps: true, twist: [0,0], angles: [
  180, 0, -120, 0, 0, 0, 0, -120, 0, 0, 0, 0, -120, 0, 0
]});

Grids.Grid114 = new Grid({ wraps: false, twist: [0,0], angles: [
  -180, 0, 0, -72, 0, 0, -72, 0, 0, -72, 0, 0, -72, 0, 0
]});

Grids.Grid115 = new Grid({ wraps: true, twist: [0,0], angles: [
  120, 0, 0, -60, 0, 0, -60, 0, 0, -60, 0, 0, -60, 0, 0, -60, 0, 0
]});

Grids.Grid116 = new Grid({ wraps: false, twist: [0,0], angles: [
  0, 90
]});

Grids.Grid119 = new Grid({ wraps: true, twist: [0,30], angles: [
  180, -108, 72, -108, 72, -108, 72, -108, 72, -108,
   72, -108, 72, -108, 72, -108, 72, -108, 72, -108
]});