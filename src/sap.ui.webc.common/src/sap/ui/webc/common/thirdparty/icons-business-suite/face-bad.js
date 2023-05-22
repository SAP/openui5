sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/face-bad", "./v2/face-bad"], function (_exports, _Theme, _faceBad, _faceBad2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _faceBad.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _faceBad.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _faceBad.pathData : _faceBad2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/face-bad";
  _exports.default = _default;
});