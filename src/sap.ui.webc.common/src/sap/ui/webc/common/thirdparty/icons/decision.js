sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/decision", "./v5/decision"], function (_exports, _Theme, _decision, _decision2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _decision.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _decision.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _decision.pathData : _decision2.pathData;
  _exports.pathData = pathData;
  var _default = "decision";
  _exports.default = _default;
});