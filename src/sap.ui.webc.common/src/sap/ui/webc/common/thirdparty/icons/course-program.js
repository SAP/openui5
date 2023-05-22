sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/course-program", "./v5/course-program"], function (_exports, _Theme, _courseProgram, _courseProgram2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _courseProgram.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _courseProgram.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _courseProgram.pathData : _courseProgram2.pathData;
  _exports.pathData = pathData;
  var _default = "course-program";
  _exports.default = _default;
});