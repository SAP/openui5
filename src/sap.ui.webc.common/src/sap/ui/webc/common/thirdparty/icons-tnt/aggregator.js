sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/aggregator", "./v3/aggregator"], function (_exports, _Theme, _aggregator, _aggregator2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _aggregator.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _aggregator.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _aggregator.pathData : _aggregator2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/aggregator";
  _exports.default = _default;
});