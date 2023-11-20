sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/python", "./v3/python"], function (_exports, _Theme, _python, _python2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _python.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _python.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _python.pathData : _python2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/python";
  _exports.default = _default;
});