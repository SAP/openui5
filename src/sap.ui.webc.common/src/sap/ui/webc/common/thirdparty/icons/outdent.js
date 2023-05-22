sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/outdent", "./v5/outdent"], function (_exports, _Theme, _outdent, _outdent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _outdent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _outdent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _outdent.pathData : _outdent2.pathData;
  _exports.pathData = pathData;
  var _default = "outdent";
  _exports.default = _default;
});