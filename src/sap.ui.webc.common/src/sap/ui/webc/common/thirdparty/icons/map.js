sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/map", "./v5/map"], function (_exports, _Theme, _map, _map2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _map.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _map.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _map.pathData : _map2.pathData;
  _exports.pathData = pathData;
  var _default = "map";
  _exports.default = _default;
});