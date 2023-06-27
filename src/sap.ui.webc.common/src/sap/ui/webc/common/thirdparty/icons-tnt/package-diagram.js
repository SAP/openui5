sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/package-diagram", "./v3/package-diagram"], function (_exports, _Theme, _packageDiagram, _packageDiagram2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _packageDiagram.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _packageDiagram.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _packageDiagram.pathData : _packageDiagram2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/package-diagram";
  _exports.default = _default;
});