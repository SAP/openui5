sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/newspaper", "./v5/newspaper"], function (_exports, _Theme, _newspaper, _newspaper2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _newspaper.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _newspaper.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _newspaper.pathData : _newspaper2.pathData;
  _exports.pathData = pathData;
  var _default = "newspaper";
  _exports.default = _default;
});