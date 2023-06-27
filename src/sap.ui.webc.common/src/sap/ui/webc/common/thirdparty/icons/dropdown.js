sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/dropdown", "./v5/dropdown"], function (_exports, _Theme, _dropdown, _dropdown2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _dropdown.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _dropdown.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _dropdown.pathData : _dropdown2.pathData;
  _exports.pathData = pathData;
  var _default = "dropdown";
  _exports.default = _default;
});