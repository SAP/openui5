sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/compressor", "./v2/compressor"], function (_exports, _Theme, _compressor, _compressor2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _compressor.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _compressor.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _compressor.pathData : _compressor2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/compressor";
  _exports.default = _default;
});