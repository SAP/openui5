sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/iphone-2", "./v5/iphone-2"], function (_exports, _Theme, _iphone, _iphone2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _iphone.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _iphone.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _iphone.pathData : _iphone2.pathData;
  _exports.pathData = pathData;
  var _default = "iphone-2";
  _exports.default = _default;
});