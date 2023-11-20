sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/accidental-leave", "./v5/accidental-leave"], function (_exports, _Theme, _accidentalLeave, _accidentalLeave2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _accidentalLeave.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _accidentalLeave.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _accidentalLeave.pathData : _accidentalLeave2.pathData;
  _exports.pathData = pathData;
  var _default = "accidental-leave";
  _exports.default = _default;
});