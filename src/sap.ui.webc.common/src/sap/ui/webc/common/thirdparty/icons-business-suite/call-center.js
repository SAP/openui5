sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/call-center", "./v2/call-center"], function (_exports, _Theme, _callCenter, _callCenter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _callCenter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _callCenter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _callCenter.pathData : _callCenter2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/call-center";
  _exports.default = _default;
});