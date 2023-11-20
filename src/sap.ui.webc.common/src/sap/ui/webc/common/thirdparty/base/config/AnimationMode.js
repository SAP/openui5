sap.ui.define(["exports", "../InitialConfiguration", "../types/AnimationMode"], function (_exports, _InitialConfiguration, _AnimationMode) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setAnimationMode = _exports.getAnimationMode = void 0;
  _AnimationMode = _interopRequireDefault(_AnimationMode);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  let curAnimationMode;
  /**
   * Returns the animation mode - "full", "basic", "minimal" or "none".
   * @public
   * @returns { AnimationMode }
   */
  const getAnimationMode = () => {
    if (curAnimationMode === undefined) {
      curAnimationMode = (0, _InitialConfiguration.getAnimationMode)();
    }
    return curAnimationMode;
  };
  /**
   * Sets the animation mode - "full", "basic", "minimal" or "none".
   * @public
   * @param { AnimationMode } animationMode
   */
  _exports.getAnimationMode = getAnimationMode;
  const setAnimationMode = animationMode => {
    if (animationMode in _AnimationMode.default) {
      curAnimationMode = animationMode;
    }
  };
  _exports.setAnimationMode = setAnimationMode;
});