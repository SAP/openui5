sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/increase-indent", "./v2/increase-indent"], function (_exports, _Theme, _increaseIndent, _increaseIndent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _increaseIndent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _increaseIndent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _increaseIndent.pathData : _increaseIndent2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/increase-indent";
  _exports.default = _default;
});