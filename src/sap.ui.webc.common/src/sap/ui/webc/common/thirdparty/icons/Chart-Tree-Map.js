sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/Chart-Tree-Map", "./v5/Chart-Tree-Map"], function (_exports, _Theme, _ChartTreeMap, _ChartTreeMap2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _ChartTreeMap.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _ChartTreeMap.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _ChartTreeMap.pathData : _ChartTreeMap2.pathData;
  _exports.pathData = pathData;
  var _default = "Chart-Tree-Map";
  _exports.default = _default;
});