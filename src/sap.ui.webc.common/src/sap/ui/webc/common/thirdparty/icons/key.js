sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/key", "./v5/key"], function (_exports, _Theme, _key, _key2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _key.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _key.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _key.pathData : _key2.pathData;
  _exports.pathData = pathData;
  var _default = "key";
  _exports.default = _default;
});