sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/program-triangles", "./v5/program-triangles"], function (_exports, _Theme, _programTriangles, _programTriangles2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _programTriangles.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _programTriangles.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _programTriangles.pathData : _programTriangles2.pathData;
  _exports.pathData = pathData;
  var _default = "program-triangles";
  _exports.default = _default;
});