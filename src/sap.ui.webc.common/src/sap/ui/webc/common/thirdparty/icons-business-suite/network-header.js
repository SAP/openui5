sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/network-header", "./v2/network-header"], function (_exports, _Theme, _networkHeader, _networkHeader2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _networkHeader.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _networkHeader.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _networkHeader.pathData : _networkHeader2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/network-header";
  _exports.default = _default;
});