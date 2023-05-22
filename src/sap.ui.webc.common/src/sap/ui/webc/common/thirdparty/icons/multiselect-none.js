sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/multiselect-none", "./v5/multiselect-none"], function (_exports, _Theme, _multiselectNone, _multiselectNone2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _multiselectNone.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _multiselectNone.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _multiselectNone.pathData : _multiselectNone2.pathData;
  _exports.pathData = pathData;
  var _default = "multiselect-none";
  _exports.default = _default;
});