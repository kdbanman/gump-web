

function GOL(canvas, cellSize, environmentWidth, environmentHeight, seedSize) {
  canvas.width = environmentWidth * cellSize;
  canvas.height = environmentHeight * cellSize;

  var igloo = this.igloo = new Igloo(canvas);
  var gl = igloo.gl;
  if (gl == null) {
    alert('Could not initialize WebGL!');
    throw new Error('No WebGL');
  }
  this.cellSize = cellSize;
  this.renderSize = new Float32Array([canvas.width, canvas.height]);
  this.environmentSize = new Float32Array([environmentWidth, environmentHeight]);

  gl.disable(gl.DEPTH_TEST);
  this.programs = {
    copy: igloo.program('src/shaders/quad.vert', 'src/shaders/copy.frag'),
    gol: igloo.program('src/shaders/quad.vert', 'src/shaders/gol.frag')
  };
  this.buffers = {
    quad: igloo.array(Igloo.QUAD2)
  };
  this.textures = {
    front: igloo.texture(null, gl.RGBA, gl.REPEAT, gl.NEAREST)
      .blank(this.environmentSize[0], this.environmentSize[1]),
    back: igloo.texture(null, gl.RGBA, gl.REPEAT, gl.NEAREST)
      .blank(this.environmentSize[0], this.environmentSize[1])
  };
  this.framebuffers = {
    step: igloo.framebuffer()
  };
  this.fillInterior(seedSize, seedSize, fillProbability = 1);
}

/**
 * Set the entire simulation state at once.
 * @param {Object} state Boolean array-like
 * @returns {GOL} this
 */
GOL.prototype.setState = function (state) {
  var gl = this.igloo.gl;
  var rgba = new Uint8Array(this.environmentSize[0] * this.environmentSize[1] * 4);
  for (var i = 0; i < state.length; i++) {
    var ii = i * 4;
    rgba[ii + 0] = rgba[ii + 1] = rgba[ii + 2] = state[i] ? 255 : 0;
    rgba[ii + 3] = 255;
  }
  this.textures.front.subset(rgba, 0, 0, this.environmentSize[0], this.environmentSize[1]);
  return this;
};

GOL.isCell = function (x, y) {
  return GOL.isHorizontalCell(x, y) || GOL.isVerticalCell(x, y);
};

GOL.isHorizontalCell = function(x, y) {
  return x % 2 == 1 && y % 2 == 0;
}

GOL.isVerticalCell = function(x, y) {
  return x % 2 == 0 && y % 2 == 1;
}

/**
 * Fill a guttered interior of the environment with live cells with the
 * provided probability.
 * @param {number} [fillWidth] Width to fill inside the environment
 * @param {number} [fillHeight] Height to fill inside the environment
 * @param {number} [fillProbability] Chance of a cell being alive (0.0 to 1.0)
 * @returns {GOL} this
 */
GOL.prototype.fillInterior = function (fillWidth, fillHeight, fillProbability = 0.95) {
  var width = this.environmentSize[0];
  var height = this.environmentSize[1];
  var size = width * height;

  var xStart = width / 2 - fillWidth / 2;
  var xEnd = xStart + fillWidth;

  var yStart = height / 2 - fillHeight / 2;
  var yEnd = yStart + fillHeight;

  var state = new Uint8Array(size);
  for (var i = 0; i < size; i++) {
    var x = i % width;
    var y = Math.floor(i / width);

    var insideGutter = x >= xStart && x < xEnd &&
                       y >= yStart && y < yEnd;

    if (Math.random() <= fillProbability && GOL.isCell(x, y) && insideGutter) {
      state[i] = 1;
    } else {
      state[i] = 0
    }
  }
  this.setState(state);
  return this;
};

/**
 * Clear the simulation state to empty.
 * @returns {GOL} this
 */
GOL.prototype.setEmpty = function () {
  this.setState(new Uint8Array(this.environmentSize[0] * this.environmentSize[1]));
  return this;
};

/**
 * Swap the texture buffers.
 * @returns {GOL} this
 */
GOL.prototype.swap = function () {
  var tmp = this.textures.front;
  this.textures.front = this.textures.back;
  this.textures.back = tmp;
  return this;
};

/**
 * Step the Game of Life state on the GPU without rendering anything.
 * @returns {GOL} this
 */
GOL.prototype.step = function () {
  var gl = this.igloo.gl;
  this.framebuffers.step.attach(this.textures.back);
  this.textures.front.bind(0);
  gl.viewport(0, 0, this.environmentSize[0], this.environmentSize[1]);
  this.programs.gol.use()
    .attrib('quad', this.buffers.quad, 2)
    .uniformi('state', 0)
    .uniform('environmentSize', this.environmentSize)
    .draw(gl.TRIANGLE_STRIP, 4);
  this.swap();
  return this;
};

/**
 * Render the Game of Life state stored on the GPU.
 * @returns {GOL} this
 */
GOL.prototype.draw = function () {
  var gl = this.igloo.gl;
  this.igloo.defaultFramebuffer.bind();
  this.textures.front.bind(0);
  gl.viewport(0, 0, this.renderSize[0], this.renderSize[1]);
  this.programs.copy.use()
    .attrib('quad', this.buffers.quad, 2)
    .uniformi('state', 0)
    .uniform('environmentSize', this.renderSize)
    .draw(gl.TRIANGLE_STRIP, 4);
  return this;
};

/**
 * Set the state at a specific position.
 * @param {number} x
 * @param {number} y
 * @param {boolean} state True/false for live/dead
 * @returns {GOL} this
 */
GOL.prototype.poke = function (x, y, state) {
  var gl = this.igloo.gl,
    v = state * 255;
  this.textures.front.subset([v, v, v, 255], x, y, 1, 1);
  return this;
};

/**
 * @returns {Object} Boolean array-like of the simulation state
 */
GOL.prototype.getState = function () {
  var gl = this.igloo.gl, w = this.environmentSize[0], h = this.environmentSize[1];
  this.framebuffers.step.attach(this.textures.front);
  var rgba = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
  var state = new Uint8Array(w * h);
  for (var i = 0; i < w * h; i++) {
    state[i] = rgba[i * 4] > 128 ? 1 : 0;
  }
  return state;
};