sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/warehouse", "./v2/warehouse"], function (_exports, _Theme, _warehouse, _warehouse2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _warehouse.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _warehouse.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _warehouse.pathData : _warehouse2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/warehouse";
  _exports.default = _default;
});