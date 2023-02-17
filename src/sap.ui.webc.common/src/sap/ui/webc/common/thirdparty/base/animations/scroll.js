sap.ui.define(["exports", "./animate", "./config"], function (_exports, _animate, _config) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _animate = _interopRequireDefault(_animate);
  _config = _interopRequireDefault(_config);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var _default = ({
    element = _config.default.element,
    duration = _config.default.duration,
    progress: progressCallback = _config.default.identity,
    dx = 0,
    dy = 0
  }) => {
    let scrollLeft;
    let scrollTop;
    return (0, _animate.default)({
      beforeStart: () => {
        scrollLeft = element.scrollLeft;
        scrollTop = element.scrollTop;
      },
      duration,
      element,
      progress: progress => {
        progressCallback(progress);
        element.scrollLeft = scrollLeft + progress * dx; // easing - linear
        element.scrollTop = scrollTop + progress * dy; // easing - linear
      }
    });
  };
  _exports.default = _default;
});