sap.ui.define(['exports', './chunk-7ceb84db'], function (exports, __chunk_1) { 'use strict';

	var animationConfig = {
	  defaultDuration: 400,
	  element: document.createElement("DIV"),
	  identity: function identity() {}
	};

	var tasks = new WeakMap();

	var AnimationQueue =
	/*#__PURE__*/
	function () {
	  function AnimationQueue() {
	    __chunk_1._classCallCheck(this, AnimationQueue);
	  }

	  __chunk_1._createClass(AnimationQueue, null, [{
	    key: "enqueue",
	    value: function enqueue(element, task) {
	      if (!tasks.has(element)) {
	        tasks.set(element, []);
	      }

	      tasks.get(element).push(task);
	    }
	  }, {
	    key: "run",
	    value: function run(element, task) {
	      if (!tasks.has(element)) {
	        tasks.set(element, []);
	      }

	      return task().then(function () {
	        var elementTasks = tasks.get(element);

	        if (elementTasks.length > 0) {
	          return AnimationQueue.run(element, elementTasks.shift());
	        }

	        tasks["delete"](element);
	      });
	    }
	  }, {
	    key: "push",
	    value: function push(element, task) {
	      var elementTasks = tasks.get(element);

	      if (elementTasks) {
	        AnimationQueue.enqueue(element, task);
	      } else {
	        AnimationQueue.run(element, task);
	      }
	    }
	  }, {
	    key: "tasks",
	    get: function get() {
	      return tasks;
	    }
	  }]);

	  return AnimationQueue;
	}();

	var animate = (function (_ref) {
	  var _ref$beforeStart = _ref.beforeStart,
	      beforeStart = _ref$beforeStart === void 0 ? animationConfig.identity : _ref$beforeStart,
	      _ref$duration = _ref.duration,
	      duration = _ref$duration === void 0 ? animationConfig.defaultDuration : _ref$duration,
	      _ref$element = _ref.element,
	      element = _ref$element === void 0 ? animationConfig.element : _ref$element,
	      _ref$progress = _ref.progress,
	      progressCallback = _ref$progress === void 0 ? animationConfig.identity : _ref$progress;
	  var start = null;
	  var stopped = false;
	  var animationFrame;

	  var _stop;

	  var _animate;

	  var _promise = new Promise(function (resolve, reject) {
	    _animate = function animate(timestamp) {
	      start = start || timestamp;
	      var timeElapsed = timestamp - start;
	      var remaining = duration - timeElapsed;

	      if (timeElapsed <= duration) {
	        var progress = 1 - remaining / duration; // easing formula (currently linear)

	        progressCallback(progress);
	        animationFrame = !stopped && requestAnimationFrame(_animate);
	      } else {
	        progressCallback(1);
	        resolve();
	      }
	    };

	    _stop = function stop() {
	      stopped = true;
	      cancelAnimationFrame(animationFrame);
	      reject(new Error("animation stopped"));
	    };
	  })["catch"](function (oReason) {
	    return oReason;
	  });

	  AnimationQueue.push(element, function () {
	    beforeStart();
	    requestAnimationFrame(_animate);
	    return new Promise(function (resolve) {
	      _promise.then(function () {
	        return resolve();
	      });
	    });
	  });
	  return {
	    promise: function promise() {
	      return _promise;
	    },
	    stop: function stop() {
	      return _stop;
	    }
	  };
	});

	var slideDown = (function (_ref) {
	  var _ref$element = _ref.element,
	      element = _ref$element === void 0 ? animationConfig.element : _ref$element,
	      _ref$duration = _ref.duration,
	      duration = _ref$duration === void 0 ? animationConfig.defaultDuration : _ref$duration,
	      _ref$progress = _ref.progress,
	      progressCallback = _ref$progress === void 0 ? animationConfig.identity : _ref$progress;
	  var computedStyles, paddingTop, paddingBottom, marginTop, marginBottom, height;
	  var storedOverflow, storedPaddingTop, storedPaddingBottom, storedMarginTop, storedMarginBottom, storedHeight;
	  var animation = animate({
	    beforeStart: function beforeStart() {
	      // Show the element to measure its properties
	      element.style.display = "block"; // Get Computed styles

	      computedStyles = getComputedStyle(element);
	      paddingTop = parseFloat(computedStyles.paddingTop);
	      paddingBottom = parseFloat(computedStyles.paddingBottom);
	      marginTop = parseFloat(computedStyles.marginTop);
	      marginBottom = parseFloat(computedStyles.marginBottom);
	      height = parseFloat(computedStyles.height); // Store inline styles

	      storedOverflow = element.style.overflow;
	      storedPaddingTop = element.style.paddingTop;
	      storedPaddingBottom = element.style.paddingBottom;
	      storedMarginTop = element.style.marginTop;
	      storedMarginBottom = element.style.marginBottom;
	      storedHeight = element.style.height;
	      element.style.overflow = "hidden";
	      element.style.paddingTop = 0;
	      element.style.paddingBottom = 0;
	      element.style.marginTop = 0;
	      element.style.marginBottom = 0;
	      element.style.height = 0;
	    },
	    duration: duration,
	    element: element,
	    progress: function progress(_progress) {
	      progressCallback(_progress); // WORKAROUND

	      element.style.display = "block"; // END OF WORKAROUND

	      /* eslint-disable */

	      element.style.paddingTop = 0 + paddingTop * _progress + "px";
	      element.style.paddingBottom = 0 + paddingBottom * _progress + "px";
	      element.style.marginTop = 0 + marginTop * _progress + "px";
	      element.style.marginBottom = 0 + marginBottom * _progress + "px";
	      element.style.height = 0 + height * _progress + "px";
	      /* eslint-enable */
	    }
	  });
	  animation.promise().then(function () {
	    element.style.overflow = storedOverflow;
	    element.style.paddingTop = storedPaddingTop;
	    element.style.paddingBottom = storedPaddingBottom;
	    element.style.marginTop = storedMarginTop;
	    element.style.marginBottom = storedMarginBottom;
	    element.style.height = storedHeight;
	  });
	  return animation;
	});

	var slideUp = (function (_ref) {
	  var _ref$element = _ref.element,
	      element = _ref$element === void 0 ? animationConfig.element : _ref$element,
	      _ref$duration = _ref.duration,
	      duration = _ref$duration === void 0 ? animationConfig.defaultDuration : _ref$duration,
	      _ref$progress = _ref.progress,
	      progressCallback = _ref$progress === void 0 ? animationConfig.identity : _ref$progress;
	  // Get Computed styles
	  var computedStyles, paddingTop, paddingBottom, marginTop, marginBottom, height; // Store inline styles

	  var storedOverflow, storedPaddingTop, storedPaddingBottom, storedMarginTop, storedMarginBottom, storedHeight;
	  var animation = animate({
	    beforeStart: function beforeStart() {
	      // Get Computed styles
	      computedStyles = getComputedStyle(element);
	      paddingTop = parseFloat(computedStyles.paddingTop);
	      paddingBottom = parseFloat(computedStyles.paddingBottom);
	      marginTop = parseFloat(computedStyles.marginTop);
	      marginBottom = parseFloat(computedStyles.marginBottom);
	      height = parseFloat(computedStyles.height); // Store inline styles

	      storedOverflow = element.style.overflow;
	      storedPaddingTop = element.style.paddingTop;
	      storedPaddingBottom = element.style.paddingBottom;
	      storedMarginTop = element.style.marginTop;
	      storedMarginBottom = element.style.marginBottom;
	      storedHeight = element.style.height;
	      element.style.overflow = "hidden";
	    },
	    duration: duration,
	    element: element,
	    progress: function progress(_progress) {
	      progressCallback(_progress);
	      element.style.paddingTop = "".concat(paddingTop - paddingTop * _progress, "px");
	      element.style.paddingBottom = "".concat(paddingBottom - paddingBottom * _progress, "px");
	      element.style.marginTop = "".concat(marginTop - marginTop * _progress, "px");
	      element.style.marginBottom = "".concat(marginBottom - marginBottom * _progress, "px");
	      element.style.height = "".concat(height - height * _progress, "px");
	    }
	  });
	  animation.promise().then(function (oReason) {
	    if (!(oReason instanceof Error)) {
	      element.style.overflow = storedOverflow;
	      element.style.paddingTop = storedPaddingTop;
	      element.style.paddingBottom = storedPaddingBottom;
	      element.style.marginTop = storedMarginTop;
	      element.style.marginBottom = storedMarginBottom;
	      element.style.height = storedHeight;
	      element.style.display = "none";
	    }
	  });
	  return animation;
	});

	var AnimationMode = {
	  Full: "full",
	  Basic: "basic",
	  Minimal: "minimal",
	  None: "none"
	};

	var animationMode;

	var getAnimationMode = function getAnimationMode() {
	  if (animationMode === undefined) {
	    animationMode = __chunk_1.getAnimationMode();
	  }

	  return animationMode;
	};

	exports.getAnimationMode = getAnimationMode;
	exports.AnimationMode = AnimationMode;
	exports.slideUp = slideUp;
	exports.slideDown = slideDown;
	exports.animate = animate;
	exports.animationConfig = animationConfig;

});
//# sourceMappingURL=chunk-a1b7ce0b.js.map
