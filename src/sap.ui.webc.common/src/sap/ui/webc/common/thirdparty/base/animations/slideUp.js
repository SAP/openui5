sap.ui.define(["exports", "./animate"], function (_exports, _animate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _animate = _interopRequireWildcard(_animate);
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  const slideUp = element => {
    // Get Computed styles
    let computedStyles, paddingTop, paddingBottom, marginTop, marginBottom, height;
    // Store inline styles
    let storedOverflow, storedPaddingTop, storedPaddingBottom, storedMarginTop, storedMarginBottom, storedHeight;
    const animation = (0, _animate.default)({
      beforeStart: () => {
        // Get Computed styles
        const el = element;
        computedStyles = getComputedStyle(el);
        paddingTop = parseFloat(computedStyles.paddingTop);
        paddingBottom = parseFloat(computedStyles.paddingBottom);
        marginTop = parseFloat(computedStyles.marginTop);
        marginBottom = parseFloat(computedStyles.marginBottom);
        height = parseFloat(computedStyles.height);
        // Store inline styles
        storedOverflow = el.style.overflow;
        storedPaddingTop = el.style.paddingTop;
        storedPaddingBottom = el.style.paddingBottom;
        storedMarginTop = el.style.marginTop;
        storedMarginBottom = el.style.marginBottom;
        storedHeight = el.style.height;
        el.style.overflow = "hidden";
      },
      duration: _animate.duration,
      element,
      advance: progress => {
        element.style.paddingTop = `${paddingTop - paddingTop * progress}px`;
        element.style.paddingBottom = `${paddingBottom - paddingBottom * progress}px`;
        element.style.marginTop = `${marginTop - marginTop * progress}px`;
        element.style.marginBottom = `${marginBottom - marginBottom * progress}px`;
        element.style.height = `${height - height * progress}px`;
      }
    });
    animation.promise().then(reason => {
      if (!(reason instanceof Error)) {
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
  };
  var _default = slideUp;
  _exports.default = _default;
});