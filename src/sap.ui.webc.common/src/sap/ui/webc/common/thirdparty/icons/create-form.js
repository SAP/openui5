sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/create-form", "./v5/create-form"], function (_exports, _Theme, _createForm, _createForm2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _createForm.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _createForm.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _createForm.pathData : _createForm2.pathData;
  _exports.pathData = pathData;
  var _default = "create-form";
  _exports.default = _default;
});