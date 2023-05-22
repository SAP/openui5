sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/technicalsystem", "./v3/technicalsystem"], function (_exports, _Theme, _technicalsystem, _technicalsystem2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _technicalsystem.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _technicalsystem.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _technicalsystem.pathData : _technicalsystem2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/technicalsystem";
  _exports.default = _default;
});