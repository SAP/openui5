sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/multiselect-all", "./v5/multiselect-all"], function (_exports, _Theme, _multiselectAll, _multiselectAll2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _multiselectAll.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _multiselectAll.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _multiselectAll.pathData : _multiselectAll2.pathData;
  _exports.pathData = pathData;
  var _default = "multiselect-all";
  _exports.default = _default;
});