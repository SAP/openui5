sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/open-command-field", "./v5/open-command-field"], function (_exports, _Theme, _openCommandField, _openCommandField2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _openCommandField.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _openCommandField.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _openCommandField.pathData : _openCommandField2.pathData;
  _exports.pathData = pathData;
  var _default = "open-command-field";
  _exports.default = _default;
});