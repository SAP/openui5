sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/performance", "./v5/performance"], function (_exports, _Theme, _performance, _performance2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _performance.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _performance.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _performance.pathData : _performance2.pathData;
  _exports.pathData = pathData;
  var _default = "performance";
  _exports.default = _default;
});