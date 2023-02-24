sap.ui.define(["exports", "./AnimationQueue", "./config"], function (_exports, _AnimationQueue, _config) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _AnimationQueue = _interopRequireDefault(_AnimationQueue);
  _config = _interopRequireDefault(_config);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var _default = ({
    beforeStart = _config.default.identity,
    duration = _config.default.defaultDuration,
    element = _config.default.element,
    progress: progressCallback = _config.default.identity
  }) => {
    let start = null;
    let stopped = false;
    let animationFrame;
    let stop;
    let animate;
    const promise = new Promise((resolve, reject) => {
      animate = timestamp => {
        start = start || timestamp;
        const timeElapsed = timestamp - start;
        const remaining = duration - timeElapsed;
        if (timeElapsed <= duration) {
          const progress = 1 - remaining / duration; // easing formula (currently linear)
          progressCallback(progress);
          animationFrame = !stopped && requestAnimationFrame(animate);
        } else {
          progressCallback(1);
          resolve();
        }
      };
      stop = () => {
        stopped = true;
        cancelAnimationFrame(animationFrame);
        reject(new Error("animation stopped"));
      };
    }).catch(oReason => oReason);
    _AnimationQueue.default.push(element, () => {
      beforeStart();
      requestAnimationFrame(animate);
      return new Promise(resolve => {
        promise.then(() => resolve());
      });
    });
    return {
      promise: () => promise,
      stop: () => stop
    };
  };
  _exports.default = _default;
});