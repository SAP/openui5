sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/descending-bars", "./v2/descending-bars"], function (_exports, _Theme, _descendingBars, _descendingBars2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _descendingBars.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _descendingBars.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _descendingBars.pathData : _descendingBars2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/descending-bars";
  _exports.default = _default;
});