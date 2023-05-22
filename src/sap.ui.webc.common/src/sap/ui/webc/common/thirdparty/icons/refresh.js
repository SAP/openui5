sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/refresh", "./v5/refresh"], function (_exports, _Theme, _refresh, _refresh2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _refresh.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _refresh.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _refresh.pathData : _refresh2.pathData;
  _exports.pathData = pathData;
  var _default = "refresh";
  _exports.default = _default;
});