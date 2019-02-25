(function () {

  // STATIC PER-RUN CONFIGURATION

  // Cells have 6 friendly neighbor cells
  // These vectors define the birth and survival conditions in terms of
  // the number of live neighbors.
  var SURVIVAL_FROM_NEIGHBORS = [ 1, 2, 3, 4 ];
  var BIRTH_FROM_NEIGHBORS = [ 3, 4 ];

  var SEED_DENSITY = 1.0;
  var SEED_SIZE = 93;
  var ENVIRONMENT_SIZE = 128;  // this should be "rendersize"

  var CELL_SIZE = 5;
  var CELL_WIDTH = 1;
  var SPACE_WIDTH = 10;

  // VARIABLE CONFIGURATION

  var FRAMERATE = 60;
  var ITERATIONS_PER_FRAME = 1000;




  var automaton = null;

  var setup = function () {
    var $canvas = $("#automata-draw-canvas");
    automaton = new GOL($canvas[0], CELL_SIZE, ENVIRONMENT_SIZE, ENVIRONMENT_SIZE, SEED_SIZE).draw();
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

    setTimeout(function () {
      start(FRAMERATE);
    }, 2000);
  });
})();