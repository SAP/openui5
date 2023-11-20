sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/study-leave", "./v5/study-leave"], function (_exports, _Theme, _studyLeave, _studyLeave2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _studyLeave.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _studyLeave.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _studyLeave.pathData : _studyLeave2.pathData;
  _exports.pathData = pathData;
  var _default = "study-leave";
  _exports.default = _default;
});