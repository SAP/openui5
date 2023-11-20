sap.ui.define(["exports", "./ManagedStyles", "./generated/css/SystemCSSVars.css"], function (_exports, _ManagedStyles, _SystemCSSVars) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _SystemCSSVars = _interopRequireDefault(_SystemCSSVars);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const insertSystemCSSVars = () => {
    if (!(0, _ManagedStyles.hasStyle)("data-ui5-system-css-vars")) {
      (0, _ManagedStyles.createStyle)(_SystemCSSVars.default, "data-ui5-system-css-vars");
    }
  };
  var _default = insertSystemCSSVars;
  _exports.default = _default;
});