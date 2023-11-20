sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/alert", "./v5/alert"], function (_exports, _Theme, _alert, _alert2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _alert.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _alert.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _alert.pathData : _alert2.pathData;
  _exports.pathData = pathData;
  var _default = "alert";
  _exports.default = _default;
});