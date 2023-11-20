sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/add", "./v5/add"], function (_exports, _Theme, _add, _add2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _add.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _add.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _add.pathData : _add2.pathData;
  _exports.pathData = pathData;
  var _default = "add";
  _exports.default = _default;
});