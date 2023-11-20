sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/class", "./v2/class"], function (_exports, _Theme, _class, _class2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _class.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _class.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _class.pathData : _class2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/class";
  _exports.default = _default;
});