sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/subject", "./v3/subject"], function (_exports, _Theme, _subject, _subject2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _subject.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _subject.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _subject.pathData : _subject2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/subject";
  _exports.default = _default;
});