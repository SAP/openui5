sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/chevron-phase", "./v5/chevron-phase"], function (_exports, _Theme, _chevronPhase, _chevronPhase2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _chevronPhase.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _chevronPhase.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _chevronPhase.pathData : _chevronPhase2.pathData;
  _exports.pathData = pathData;
  var _default = "chevron-phase";
  _exports.default = _default;
});