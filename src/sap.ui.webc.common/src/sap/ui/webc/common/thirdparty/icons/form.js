sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/form", "./v5/form"], function (_exports, _Theme, _form, _form2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _form.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _form.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _form.pathData : _form2.pathData;
  _exports.pathData = pathData;
  var _default = "form";
  _exports.default = _default;
});