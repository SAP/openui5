sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/locate-me", "./v5/locate-me"], function (_exports, _Theme, _locateMe, _locateMe2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _locateMe.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _locateMe.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _locateMe.pathData : _locateMe2.pathData;
  _exports.pathData = pathData;
  var _default = "locate-me";
  _exports.default = _default;
});