sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/bdd-diagram", "./v3/bdd-diagram"], function (_exports, _Theme, _bddDiagram, _bddDiagram2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bddDiagram.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bddDiagram.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bddDiagram.pathData : _bddDiagram2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/bdd-diagram";
  _exports.default = _default;
});