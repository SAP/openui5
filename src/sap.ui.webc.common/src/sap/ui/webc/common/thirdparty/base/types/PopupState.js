sap.ui.define(["exports", "./DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  const PopupStates = {
    /**
     * Open and currently not changing states.
     * @public
     */
    OPEN: "OPEN",

    /**
     * Closed and currently not changing states.
     * @public
     */
    CLOSED: "CLOSED",

    /**
     * Already left the CLOSED state, is not OPEN yet, but in the process of getting OPEN.
     * @public
     */
    OPENING: "OPENING",

    /**
     * Still open, but in the process of going to the CLOSED state.
     * @public
     */
    CLOSING: "CLOSING"
  };

  class PopupState extends _DataType.default {
    static isValid(value) {
      return !!PopupStates[value];
    }

  }

  PopupState.generateTypeAccessors(PopupStates);
  var _default = PopupState;
  _exports.default = _default;
});