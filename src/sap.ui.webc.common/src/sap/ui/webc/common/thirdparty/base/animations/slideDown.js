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
        element.style.paddingTop = 0;
        element.style.paddingBottom = 0;
        element.style.marginTop = 0;
        element.style.marginBottom = 0;
        element.style.height = 0;
      },
      duration,
      element,
      progress(progress) {
        progressCallback(progress);

        // WORKAROUND
        element.style.display = "block";
        // END OF WORKAROUND

        /* eslint-disable */
        element.style.paddingTop = 0 + paddingTop * progress + "px";
        element.style.paddingBottom = 0 + paddingBottom * progress + "px";
        element.style.marginTop = 0 + marginTop * progress + "px";
        element.style.marginBottom = 0 + marginBottom * progress + "px";
        element.style.height = 0 + height * progress + "px";
        /* eslint-enable */
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
  _exports.default = _default;
});