sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/arrow", "./v3/arrow"], function (_exports, _Theme, _arrow, _arrow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _arrow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _arrow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _arrow.pathData : _arrow2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/arrow";
  _exports.default = _default;
});