sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/unwired", "./v5/unwired"], function (_exports, _Theme, _unwired, _unwired2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _unwired.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _unwired.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _unwired.pathData : _unwired2.pathData;
  _exports.pathData = pathData;
  var _default = "unwired";
  _exports.default = _default;
});