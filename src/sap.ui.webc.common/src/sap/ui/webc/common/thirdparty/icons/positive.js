sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/positive", "./v5/positive"], function (_exports, _Theme, _positive, _positive2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _positive.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _positive.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _positive.pathData : _positive2.pathData;
  _exports.pathData = pathData;
  var _default = "positive";
  _exports.default = _default;
});