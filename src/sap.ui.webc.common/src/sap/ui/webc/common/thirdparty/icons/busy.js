sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/busy", "./v4/busy"], function (_exports, _Theme, _busy, _busy2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _busy.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _busy.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _busy.pathData : _busy2.pathData;
  _exports.pathData = pathData;
  var _default = "busy";
  _exports.default = _default;
});