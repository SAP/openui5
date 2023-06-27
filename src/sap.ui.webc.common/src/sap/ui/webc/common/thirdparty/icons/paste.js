sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/paste", "./v5/paste"], function (_exports, _Theme, _paste, _paste2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _paste.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _paste.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _paste.pathData : _paste2.pathData;
  _exports.pathData = pathData;
  var _default = "paste";
  _exports.default = _default;
});