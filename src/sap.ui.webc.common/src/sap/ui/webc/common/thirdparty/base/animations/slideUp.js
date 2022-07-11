sap.ui.define(["exports", "./config", "./animate"], function (_exports, _config, _animate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _config = _interopRequireDefault(_config);
  _animate = _interopRequireDefault(_animate);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var _default = ({
    element = _config.default.element,
    duration = _config.default.defaultDuration,
    progress: progressCallback = _config.default.identity
  }) => {
    // Get Computed styles
    let computedStyles, paddingTop, paddingBottom, marginTop, marginBottom, height; // Store inline styles

    let storedOverflow, storedPaddingTop, storedPaddingBottom, storedMarginTop, storedMarginBottom, storedHeight;
    const animation = (0, _animate.default)({
      beforeStart: () => {
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
      duration,
      element,

      progress(progress) {
        progressCallback(progress);
        element.style.paddingTop = `${paddingTop - paddingTop * progress}px`;
        element.style.paddingBottom = `${paddingBottom - paddingBottom * progress}px`;
        element.style.marginTop = `${marginTop - marginTop * progress}px`;
        element.style.marginBottom = `${marginBottom - marginBottom * progress}px`;
        element.style.height = `${height - height * progress}px`;
      }

    });
    animation.promise().then(oReason => {
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
  };

  _exports.default = _default;
});