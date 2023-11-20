sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/chart-table-view", "./v5/chart-table-view"], function (_exports, _Theme, _chartTableView, _chartTableView2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _chartTableView.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _chartTableView.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _chartTableView.pathData : _chartTableView2.pathData;
  _exports.pathData = pathData;
  var _default = "chart-table-view";
  _exports.default = _default;
});