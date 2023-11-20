sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/ipad-2", "./v5/ipad-2"], function (_exports, _Theme, _ipad, _ipad2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _ipad.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _ipad.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _ipad.pathData : _ipad2.pathData;
  _exports.pathData = pathData;
  var _default = "ipad-2";
  _exports.default = _default;
});