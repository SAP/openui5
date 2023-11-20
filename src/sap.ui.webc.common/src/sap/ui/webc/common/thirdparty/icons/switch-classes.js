sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/switch-classes", "./v5/switch-classes"], function (_exports, _Theme, _switchClasses, _switchClasses2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _switchClasses.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _switchClasses.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _switchClasses.pathData : _switchClasses2.pathData;
  _exports.pathData = pathData;
  var _default = "switch-classes";
  _exports.default = _default;
});