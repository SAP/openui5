sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/user-edit", "./v5/user-edit"], function (_exports, _Theme, _userEdit, _userEdit2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _userEdit.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _userEdit.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _userEdit.pathData : _userEdit2.pathData;
  _exports.pathData = pathData;
  var _default = "user-edit";
  _exports.default = _default;
});