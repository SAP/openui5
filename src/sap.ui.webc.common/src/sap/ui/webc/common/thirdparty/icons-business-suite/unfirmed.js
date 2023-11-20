sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/unfirmed", "./v2/unfirmed"], function (_exports, _Theme, _unfirmed, _unfirmed2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _unfirmed.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _unfirmed.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _unfirmed.pathData : _unfirmed2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/unfirmed";
  _exports.default = _default;
});