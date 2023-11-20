sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/firmed", "./v2/firmed"], function (_exports, _Theme, _firmed, _firmed2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _firmed.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _firmed.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _firmed.pathData : _firmed2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/firmed";
  _exports.default = _default;
});