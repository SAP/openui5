sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/notes", "./v5/notes"], function (_exports, _Theme, _notes, _notes2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _notes.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _notes.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _notes.pathData : _notes2.pathData;
  _exports.pathData = pathData;
  var _default = "notes";
  _exports.default = _default;
});