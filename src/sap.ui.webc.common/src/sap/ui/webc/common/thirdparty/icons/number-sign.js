sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/number-sign", "./v5/number-sign"], function (_exports, _Theme, _numberSign, _numberSign2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _numberSign.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _numberSign.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _numberSign.pathData : _numberSign2.pathData;
  _exports.pathData = pathData;
  var _default = "number-sign";
  _exports.default = _default;
});