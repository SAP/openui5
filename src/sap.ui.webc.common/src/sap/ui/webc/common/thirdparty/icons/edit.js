sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/edit", "./v5/edit"], function (_exports, _Theme, _edit, _edit2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _edit.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _edit.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _edit.pathData : _edit2.pathData;
  _exports.pathData = pathData;
  var _default = "edit";
  _exports.default = _default;
});