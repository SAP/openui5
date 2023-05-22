sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/kpi-managing-my-area", "./v5/kpi-managing-my-area"], function (_exports, _Theme, _kpiManagingMyArea, _kpiManagingMyArea2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _kpiManagingMyArea.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _kpiManagingMyArea.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _kpiManagingMyArea.pathData : _kpiManagingMyArea2.pathData;
  _exports.pathData = pathData;
  var _default = "kpi-managing-my-area";
  _exports.default = _default;
});