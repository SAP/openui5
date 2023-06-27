sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/table-view", "./v5/table-view"], function (_exports, _Theme, _tableView, _tableView2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tableView.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tableView.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tableView.pathData : _tableView2.pathData;
  _exports.pathData = pathData;
  var _default = "table-view";
  _exports.default = _default;
});