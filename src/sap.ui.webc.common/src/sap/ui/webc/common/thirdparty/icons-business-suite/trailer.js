sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/trailer", "./v2/trailer"], function (_exports, _Theme, _trailer, _trailer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _trailer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _trailer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _trailer.pathData : _trailer2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/trailer";
  _exports.default = _default;
});