sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/underline", "./v2/underline"], function (_exports, _Theme, _underline, _underline2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _underline.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _underline.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _underline.pathData : _underline2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/underline";
  _exports.default = _default;
});