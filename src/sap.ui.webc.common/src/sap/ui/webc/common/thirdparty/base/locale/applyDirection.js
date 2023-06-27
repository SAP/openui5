sap.ui.define(["exports", "../Render", "./directionChange"], function (_exports, _Render, _directionChange) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Re-renders all RTL-aware UI5 Elements.
   *
   * <b>Note:</b> Call this method whenever you change the "dir" property anywhere in your HTML page.
   * <b>Example:</b> <code>document.body.dir = "rtl"; applyDirection();</code>
   * @public
   * @returns {Promise<void>}
   */
  const applyDirection = async () => {
    const listenersResults = (0, _directionChange.fireDirectionChange)();
    await Promise.all(listenersResults);
    await (0, _Render.reRenderAllUI5Elements)({
      rtlAware: true
    });
  };
  var _default = applyDirection;
  _exports.default = _default;
});