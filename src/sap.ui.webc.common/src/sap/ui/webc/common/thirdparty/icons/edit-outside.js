sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/edit-outside", "./v5/edit-outside"], function (_exports, _Theme, _editOutside, _editOutside2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _editOutside.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _editOutside.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _editOutside.pathData : _editOutside2.pathData;
  _exports.pathData = pathData;
  var _default = "edit-outside";
  _exports.default = _default;
});