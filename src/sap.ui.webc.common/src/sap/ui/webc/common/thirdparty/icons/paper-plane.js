sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/paper-plane", "./v5/paper-plane"], function (_exports, _Theme, _paperPlane, _paperPlane2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _paperPlane.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _paperPlane.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _paperPlane.pathData : _paperPlane2.pathData;
  _exports.pathData = pathData;
  var _default = "paper-plane";
  _exports.default = _default;
});