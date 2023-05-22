sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/references", "./v3/references"], function (_exports, _Theme, _references, _references2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _references.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _references.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _references.pathData : _references2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/references";
  _exports.default = _default;
});