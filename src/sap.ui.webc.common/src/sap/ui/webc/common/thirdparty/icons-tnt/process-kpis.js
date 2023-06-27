sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/process-kpis", "./v3/process-kpis"], function (_exports, _Theme, _processKpis, _processKpis2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _processKpis.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _processKpis.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _processKpis.pathData : _processKpis2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/process-kpis";
  _exports.default = _default;
});