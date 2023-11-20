sap.ui.define(["exports", "./animate"], function (_exports, _animate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _animate = _interopRequireWildcard(_animate);
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  const scroll = (element, dx, dy) => {
    let scrollLeft;
    let scrollTop;
    return (0, _animate.default)({
      beforeStart: () => {
        scrollLeft = element.scrollLeft;
        scrollTop = element.scrollTop;
      },
      duration: _animate.duration,
      element,
      advance: progress => {
        element.scrollLeft = scrollLeft + progress * dx; // easing - linear
        element.scrollTop = scrollTop + progress * dy; // easing - linear
      }
    });
  };
  var _default = scroll;
  _exports.default = _default;
});