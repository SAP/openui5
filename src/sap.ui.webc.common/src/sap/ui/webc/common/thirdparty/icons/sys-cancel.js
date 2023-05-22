sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sys-cancel", "./v5/sys-cancel"], function (_exports, _Theme, _sysCancel, _sysCancel2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sysCancel.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sysCancel.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sysCancel.pathData : _sysCancel2.pathData;
  _exports.pathData = pathData;
  var _default = "sys-cancel";
  _exports.default = _default;
});