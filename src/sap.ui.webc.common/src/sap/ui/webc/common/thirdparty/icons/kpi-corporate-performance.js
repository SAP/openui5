sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/kpi-corporate-performance", "./v5/kpi-corporate-performance"], function (_exports, _Theme, _kpiCorporatePerformance, _kpiCorporatePerformance2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _kpiCorporatePerformance.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _kpiCorporatePerformance.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _kpiCorporatePerformance.pathData : _kpiCorporatePerformance2.pathData;
  _exports.pathData = pathData;
  var _default = "kpi-corporate-performance";
  _exports.default = _default;
});