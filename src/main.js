(function () {

  // STATIC PER-RUN CONFIGURATION

  // Cells have 6 friendly neighbor cells
  // These vectors define the birth and survival conditions in terms of
  // the number of live neighbors.
  var SURVIVAL_FROM_NEIGHBORS = [ 1, 2, 3, 4 ];
  var BIRTH_FROM_NEIGHBORS = [ 3, 4 ];

  var SEED_DENSITY = 1.0;
  var SEED_SIZE = 91;
  var ENVIRONMENT_SIZE = SEED_SIZE + 8;  // this should be "rendersize"

  var CELL_SIZE = 2;
  var CELL_WIDTH = 1;
  var SPACE_WIDTH = 10;

  // VARIABLE CONFIGURATION

  var FRAMERATE = 60;
  var ITERATIONS_PER_FRAME = 3000;



  var generations = 0;
  var frames = 0;
  var automaton = null;

  var setup = function () {
    var $canvas = $("#automata-draw-canvas");
    automaton = new GOL($canvas[0], CELL_SIZE, ENVIRONMENT_SIZE, ENVIRONMENT_SIZE, SEED_SIZE, SEED_DENSITY).draw();
  }


  // This can be pulled into a standard setup/draw pair.
  // It would be good if I could configure pipeline weirdness (EX: population
  // countnig, lowpass) out here.  Could declare programs at setup time,
  // have draw time variation/control.
  var draw = function () {
    for(var i = 0; i < ITERATIONS_PER_FRAME; i++) {
      generations++;
      automaton.step();
    }
    automaton.draw();
    frames++;
  }


  $(document).ready(function () {
    var frameDrawTimer;
    var startTimeMillis;

    var start = function (framerate) {
      if (frameDrawTimer == null) {
        frameDrawTimer = setInterval(function () {
          draw();
        }, 1000 / framerate);
      }

      setInterval(() => {
        var elapsedSeconds = (Date.now() - startTimeMillis) / 1000;
        console.log(`IPS: ${generations / elapsedSeconds}`);
        console.log(`FPS: ${frames / elapsedSeconds}`);
        console.log(`Generations: ${generations}`);
        console.log("");
      }, 1000);
    };

    var stop = function () {
      clearInterval(frameDrawTimer);
      frameDrawTimer = null;
    };

    setup();

    setTimeout(function () {
      startTimeMillis = Date.now();
      start(FRAMERATE);
    }, 2000);
  });
})();