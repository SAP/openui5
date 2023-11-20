sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/show-edit", "./v5/show-edit"], function (_exports, _Theme, _showEdit, _showEdit2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _showEdit.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _showEdit.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _showEdit.pathData : _showEdit2.pathData;
  _exports.pathData = pathData;
  var _default = "show-edit";
  _exports.default = _default;
});