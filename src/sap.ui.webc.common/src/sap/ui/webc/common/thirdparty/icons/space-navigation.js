sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/space-navigation", "./v5/space-navigation"], function (_exports, _Theme, _spaceNavigation, _spaceNavigation2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _spaceNavigation.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _spaceNavigation.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _spaceNavigation.pathData : _spaceNavigation2.pathData;
  _exports.pathData = pathData;
  var _default = "space-navigation";
  _exports.default = _default;
});