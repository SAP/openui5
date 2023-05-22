sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/two-keys", "./v5/two-keys"], function (_exports, _Theme, _twoKeys, _twoKeys2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _twoKeys.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _twoKeys.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _twoKeys.pathData : _twoKeys2.pathData;
  _exports.pathData = pathData;
  var _default = "two-keys";
  _exports.default = _default;
});