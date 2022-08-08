sap.ui.define(["exports", "../InitialConfiguration", "../types/AnimationMode"], function (_exports, _InitialConfiguration, _AnimationMode) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setAnimationMode = _exports.getAnimationMode = void 0;
  _AnimationMode = _interopRequireDefault(_AnimationMode);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  let animationMode;

  const getAnimationMode = () => {
    if (animationMode === undefined) {
      animationMode = (0, _InitialConfiguration.getAnimationMode)();
    }

    return animationMode;
  };

  _exports.getAnimationMode = getAnimationMode;

  const setAnimationMode = newAnimationMode => {
    if (Object.values(_AnimationMode.default).includes(newAnimationMode)) {
      animationMode = newAnimationMode;
    }
  };

  _exports.setAnimationMode = setAnimationMode;
});