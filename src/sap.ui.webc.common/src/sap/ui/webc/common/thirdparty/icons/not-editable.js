sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/not-editable", "./v5/not-editable"], function (_exports, _Theme, _notEditable, _notEditable2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _notEditable.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _notEditable.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _notEditable.pathData : _notEditable2.pathData;
  _exports.pathData = pathData;
  var _default = "not-editable";
  _exports.default = _default;
});