sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/heating-cooling", "./v5/heating-cooling"], function (_exports, _Theme, _heatingCooling, _heatingCooling2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _heatingCooling.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _heatingCooling.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _heatingCooling.pathData : _heatingCooling2.pathData;
  _exports.pathData = pathData;
  var _default = "heating-cooling";
  _exports.default = _default;
});