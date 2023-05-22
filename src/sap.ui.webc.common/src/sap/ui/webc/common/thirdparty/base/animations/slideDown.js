sap.ui.define(["exports", "./animate"], function (_exports, _animate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _animate = _interopRequireWildcard(_animate);
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  const slideDown = element => {
    let computedStyles, paddingTop, paddingBottom, marginTop, marginBottom, height;
    let storedOverflow, storedPaddingTop, storedPaddingBottom, storedMarginTop, storedMarginBottom, storedHeight;
    const animation = (0, _animate.default)({
      beforeStart: () => {
        // Show the element to measure its properties
        element.style.display = "block";
        // Get Computed styles
        computedStyles = getComputedStyle(element);
        paddingTop = parseFloat(computedStyles.paddingTop);
        paddingBottom = parseFloat(computedStyles.paddingBottom);
        marginTop = parseFloat(computedStyles.marginTop);
        marginBottom = parseFloat(computedStyles.marginBottom);
        height = parseFloat(computedStyles.height);
        // Store inline styles
        storedOverflow = element.style.overflow;
        storedPaddingTop = element.style.paddingTop;
        storedPaddingBottom = element.style.paddingBottom;
        storedMarginTop = element.style.marginTop;
        storedMarginBottom = element.style.marginBottom;
        storedHeight = element.style.height;
        element.style.overflow = "hidden";
        element.style.paddingTop = "0";
        element.style.paddingBottom = "0";
        element.style.marginTop = "0";
        element.style.marginBottom = "0";
        element.style.height = "0";
      },
      duration: _animate.duration,
      element,
      advance: progress => {
        // WORKAROUND
        element.style.display = "block";
        // END OF WORKAROUND
        element.style.paddingTop = `${paddingTop * progress}px`;
        element.style.paddingBottom = `${paddingBottom * progress}px`;
        element.style.marginTop = `${marginTop * progress}px`;
        element.style.marginBottom = `${marginBottom * progress}px`;
        element.style.height = `${height * progress}px`;
      }
    });
    animation.promise().then(() => {
      element.style.overflow = storedOverflow;
      element.style.paddingTop = storedPaddingTop;
      element.style.paddingBottom = storedPaddingBottom;
      element.style.marginTop = storedMarginTop;
      element.style.marginBottom = storedMarginBottom;
      element.style.height = storedHeight;
    });
    return animation;
  };
  var _default = slideDown;
  _exports.default = _default;
});