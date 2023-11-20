sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/aggregation", "./v3/aggregation"], function (_exports, _Theme, _aggregation, _aggregation2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _aggregation.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _aggregation.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _aggregation.pathData : _aggregation2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/aggregation";
  _exports.default = _default;
});