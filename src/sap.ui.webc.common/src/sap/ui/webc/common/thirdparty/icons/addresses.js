sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/addresses", "./v5/addresses"], function (_exports, _Theme, _addresses, _addresses2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _addresses.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _addresses.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _addresses.pathData : _addresses2.pathData;
  _exports.pathData = pathData;
  var _default = "addresses";
  _exports.default = _default;
});