sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/water", "./v2/water"], function (_exports, _Theme, _water, _water2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _water.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _water.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _water.pathData : _water2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/water";
  _exports.default = _default;
});