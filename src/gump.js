function gump(spec) {
  let {
    canvas,
    environmentSize = 100,
    seedDensity = 1.0,
    seedSize = 91,
    cellWidth = 4,
    spaceWidth = 10,
    survivalFromNeighbors = [1, 2, 3, 4],
    birthFromNeighbors = [3, 4],
    framerate = 60,
    iterationsPerFrame = 1,
  } = spec;

  let {
    igloo,
    programs,
    renderSize
  } = initialize(spec);

  function initialize(spec) {

  }

  function setState(state) {

  };

  function step() {

  };

  function draw() {

  };

  return {
    step,
    draw
  }
}