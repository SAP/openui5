sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/add-note", "./v2/add-note"], function (_exports, _Theme, _addNote, _addNote2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _addNote.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _addNote.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _addNote.pathData : _addNote2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/add-note";
  _exports.default = _default;
});