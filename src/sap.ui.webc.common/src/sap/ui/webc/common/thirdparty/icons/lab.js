sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/lab", "./v5/lab"], function (_exports, _Theme, _lab, _lab2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _lab.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _lab.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _lab.pathData : _lab2.pathData;
  _exports.pathData = pathData;
  var _default = "lab";
  _exports.default = _default;
});