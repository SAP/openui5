sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/less", "./v5/less"], function (_exports, _Theme, _less, _less2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _less.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _less.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _less.pathData : _less2.pathData;
  _exports.pathData = pathData;
  var _default = "less";
  _exports.default = _default;
});