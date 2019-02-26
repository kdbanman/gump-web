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
  var MEASUREMENT_INTERVAL_MILLISECONDS = 2000;
  var FRAMERATE = 60;


  // APPLICATION STATE
  var iterationsPerFrame = 1;
  var iterations = 0;
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
    for(var i = 0; i < iterationsPerFrame; i++) {
      automaton.step();
    }
    automaton.draw();
    iterations += iterationsPerFrame;
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

      var lastMeasurementMillis = +Date.now()
      var lastMeasurementFrames = frames;
      var lastMeasurementIterations = iterations;
      setInterval(() => {
        var measurementMillis = +Date.now();
        var elapsedSeconds = (measurementMillis - lastMeasurementMillis) / 1000;
        console.log("");
        console.log(`IPF: ${iterationsPerFrame}`);
        console.log(`FPS: ${(frames - lastMeasurementFrames) / elapsedSeconds}`);
        console.log(`IPS: ${(iterations - lastMeasurementIterations) / elapsedSeconds}`);
        console.log(`Iterations: ${iterations.toLocaleString()}`);

        lastMeasurementMillis = measurementMillis;
        lastMeasurementFrames = frames;
        lastMeasurementIterations = iterations;
      }, MEASUREMENT_INTERVAL_MILLISECONDS);
    };

    var stop = function () {
      clearInterval(frameDrawTimer);
      frameDrawTimer = null;
    };

    setup();

    setTimeout(function () {
      startTimeMillis = +Date.now();
      start(FRAMERATE);
    }, 2000);

    var slider = document.getElementById("iterations-per-frame-slider");
    slider.value = iterationsPerFrame;
    slider.oninput = function () {
      iterationsPerFrame = parseInt(this.value);
    }
  });
})();