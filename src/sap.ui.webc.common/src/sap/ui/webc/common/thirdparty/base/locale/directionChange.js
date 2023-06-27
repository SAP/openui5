sap.ui.define(["exports", "../EventProvider"], function (_exports, _EventProvider) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.fireDirectionChange = _exports.detachDirectionChange = _exports.attachDirectionChange = void 0;
  _EventProvider = _interopRequireDefault(_EventProvider);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const eventProvider = new _EventProvider.default();
  const DIR_CHANGE = "directionChange";
  /**
   * Attach a callback that will be executed whenever the application calls the "applyDirection" function
   * @public
   * @param listener
   */
  const attachDirectionChange = listener => {
    eventProvider.attachEvent(DIR_CHANGE, listener);
  };
  /**
   * Detach a callback that was passed with "attachDirectionChange"
   * @public
   * @param listener
   */
  _exports.attachDirectionChange = attachDirectionChange;
  const detachDirectionChange = listener => {
    eventProvider.detachEvent(DIR_CHANGE, listener);
  };
  _exports.detachDirectionChange = detachDirectionChange;
  const fireDirectionChange = () => {
    return eventProvider.fireEvent(DIR_CHANGE, undefined);
  };
  _exports.fireDirectionChange = fireDirectionChange;
});