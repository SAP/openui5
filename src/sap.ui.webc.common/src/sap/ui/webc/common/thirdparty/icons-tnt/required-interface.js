sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/required-interface", "./v3/required-interface"], function (_exports, _Theme, _requiredInterface, _requiredInterface2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _requiredInterface.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _requiredInterface.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _requiredInterface.pathData : _requiredInterface2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/required-interface";
  _exports.default = _default;
});