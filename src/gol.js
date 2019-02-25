
/**
 * Game of Life simulation and display.
 * @param {HTMLCanvasElement} canvas Render target
 * @param {number} [scale] Size of each cell in pixels (power of 2)
 */
function GOL(canvas, scale) {
  var igloo = this.igloo = new Igloo(canvas);
  var gl = igloo.gl;
  if (gl == null) {
    alert('Could not initialize WebGL!');
    throw new Error('No WebGL');
  }
  scale = this.scale = scale || 4;
  var w = canvas.width, h = canvas.height;
  this.viewsize = new Float32Array([w, h]);
  this.statesize = new Float32Array([w / scale, h / scale]);

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
      .blank(this.statesize[0], this.statesize[1]),
    back: igloo.texture(null, gl.RGBA, gl.REPEAT, gl.NEAREST)
      .blank(this.statesize[0], this.statesize[1])
  };
  this.framebuffers = {
    step: igloo.framebuffer()
  };
  this.setRandom();
}

/**
 * Set the entire simulation state at once.
 * @param {Object} state Boolean array-like
 * @returns {GOL} this
 */
GOL.prototype.setState = function (state) {
  var gl = this.igloo.gl;
  var rgba = new Uint8Array(this.statesize[0] * this.statesize[1] * 4);
  for (var i = 0; i < state.length; i++) {
    var ii = i * 4;
    rgba[ii + 0] = rgba[ii + 1] = rgba[ii + 2] = state[i] ? 255 : 0;
    rgba[ii + 3] = 255;
  }
  this.textures.front.subset(rgba, 0, 0, this.statesize[0], this.statesize[1]);
  return this;
};

/**
 * Fill the entire state with random values.
 * @param {number} [p] Chance of a cell being alive (0.0 to 1.0)
 * @returns {GOL} this
 */
GOL.prototype.setRandom = function (p) {
  var gl = this.igloo.gl, size = this.statesize[0] * this.statesize[1];
  p = p == null ? 0.5 : p;
  var rand = new Uint8Array(size);
  for (var i = 0; i < size; i++) {
    rand[i] = Math.random() < p ? 1 : 0;
  }
  this.setState(rand);
  return this;
};

/**
 * Clear the simulation state to empty.
 * @returns {GOL} this
 */
GOL.prototype.setEmpty = function () {
  this.setState(new Uint8Array(this.statesize[0] * this.statesize[1]));
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
  gl.viewport(0, 0, this.statesize[0], this.statesize[1]);
  this.programs.gol.use()
    .attrib('quad', this.buffers.quad, 2)
    .uniformi('state', 0)
    .uniform('scale', this.statesize)
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
  gl.viewport(0, 0, this.viewsize[0], this.viewsize[1]);
  this.programs.copy.use()
    .attrib('quad', this.buffers.quad, 2)
    .uniformi('state', 0)
    .uniform('scale', this.viewsize)
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
  var gl = this.igloo.gl, w = this.statesize[0], h = this.statesize[1];
  this.framebuffers.step.attach(this.textures.front);
  var rgba = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
  var state = new Uint8Array(w * h);
  for (var i = 0; i < w * h; i++) {
    state[i] = rgba[i * 4] > 128 ? 1 : 0;
  }
  return state;
};

/**
 * Find simulation coordinates for event.
 * This is a workaround for Firefox bug #69787 and jQuery bug #8523.
 * @returns {Array} target-relative offset
 */
GOL.prototype.eventCoord = function (event) {
  var $target = $(event.target),
    offset = $target.offset(),
    border = 1,
    x = event.pageX - offset.left - border,
    y = $target.height() - (event.pageY - offset.top - border);
  return [Math.floor(x / this.scale), Math.floor(y / this.scale)];
};