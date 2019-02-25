(function () {
  // Cells have 6 friendly neighbor cells
  // These vectors define the birth and survival conditions in terms of
  // the number of live neighbors.
  var SURVIVAL_FROM_NEIGHBORS = [ 1, 2, 3, 4 ];
  var BIRTH_FROM_NEIGHBORS = [ 3, 4 ];

  var ENVIRONMENT_SIZE = 256;

  var FRAMERATE = 60;
  var ITERATIONS_PER_FRAME = 1;
  var CELL_SIZE = 1;

  var automaton = null;


  var setup = function () {
    var canvas = document.getElementById("automata-draw-canvas");
    canvas.width = ENVIRONMENT_SIZE * CELL_SIZE;
    canvas.height = ENVIRONMENT_SIZE * CELL_SIZE;

    var $canvas = $("#automata-draw-canvas");
    automaton = new GOL($canvas[0], CELL_SIZE).draw();
  }


  // This can be pulled into a standard setup/draw pair.
  // It would be good if I could configure pipeline weirdness (EX: population
  // countnig, lowpass) out here.  Could declare programs at setup time,
  // have draw time variation/control.
  var draw = function () {
    for(var i = 0; i < ITERATIONS_PER_FRAME; i++) {
      automaton.step();
    }
    automaton.draw();
  }


  $(document).ready(function () {
    var frameDrawTimer = null;

    var start = function (framerate) {
      if (frameDrawTimer == null) {
        frameDrawTimer = setInterval(function () {
          draw();
        }, 1000 / framerate);
      }
    };

    var stop = function () {
      clearInterval(frameDrawTimer);
      frameDrawTimer = null;
    };

    setup();
    start(FRAMERATE);
    setTimeout(function () {
      stop();
    }, 2000);
  });
})();