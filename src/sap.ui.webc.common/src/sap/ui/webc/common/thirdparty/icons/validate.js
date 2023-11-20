sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/validate", "./v5/validate"], function (_exports, _Theme, _validate, _validate2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _validate.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _validate.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _validate.pathData : _validate2.pathData;
  _exports.pathData = pathData;
  var _default = "validate";
  _exports.default = _default;
});