sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/cursor", "./v3/cursor"], function (_exports, _Theme, _cursor, _cursor2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cursor.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cursor.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _cursor.pathData : _cursor2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/cursor";
  _exports.default = _default;
});