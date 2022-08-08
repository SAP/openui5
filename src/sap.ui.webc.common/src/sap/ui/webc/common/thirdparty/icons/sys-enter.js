sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/sys-enter", "./v4/sys-enter"], function (_exports, _Theme, _sysEnter, _sysEnter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sysEnter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sysEnter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _sysEnter.pathData : _sysEnter2.pathData;
  _exports.pathData = pathData;
  var _default = "sys-enter";
  _exports.default = _default;
});