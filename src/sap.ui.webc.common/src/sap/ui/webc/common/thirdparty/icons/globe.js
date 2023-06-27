sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/globe", "./v5/globe"], function (_exports, _Theme, _globe, _globe2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _globe.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _globe.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _globe.pathData : _globe2.pathData;
  _exports.pathData = pathData;
  var _default = "globe";
  _exports.default = _default;
});