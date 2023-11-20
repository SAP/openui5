sap.ui.define(["exports", "./AnimationQueue"], function (_exports, _AnimationQueue) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.duration = _exports.default = void 0;
  _AnimationQueue = _interopRequireDefault(_AnimationQueue);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const animate = options => {
    let start = null;
    let stopped = false;
    let animationFrame;
    let stop;
    let advanceAnimation;
    const promise = new Promise((resolve, reject) => {
      advanceAnimation = timestamp => {
        start = start || timestamp;
        const timeElapsed = timestamp - start;
        const remaining = options.duration - timeElapsed;
        if (timeElapsed <= options.duration) {
          const currentAdvance = 1 - remaining / options.duration; // easing formula (currently linear)
          options.advance(currentAdvance);
          if (!stopped) {
            animationFrame = requestAnimationFrame(advanceAnimation);
          }
        } else {
          options.advance(1);
          resolve();
        }
      };
      stop = () => {
        stopped = true;
        cancelAnimationFrame(animationFrame);
        reject(new Error("animation stopped"));
      };
    }).catch(reason => reason);
    _AnimationQueue.default.push(options.element, () => {
      if (typeof options.beforeStart === "function") {
        options.beforeStart();
      }
      requestAnimationFrame(advanceAnimation);
      return new Promise(resolve => {
        promise.then(() => resolve());
      });
    });
    return {
      promise: () => promise,
      stop: () => stop
    };
  };
  const duration = 400;
  _exports.duration = duration;
  var _default = animate;
  _exports.default = _default;
});