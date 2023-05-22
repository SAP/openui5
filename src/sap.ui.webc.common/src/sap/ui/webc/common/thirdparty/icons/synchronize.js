sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/synchronize", "./v5/synchronize"], function (_exports, _Theme, _synchronize, _synchronize2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _synchronize.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _synchronize.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _synchronize.pathData : _synchronize2.pathData;
  _exports.pathData = pathData;
  var _default = "synchronize";
  _exports.default = _default;
});