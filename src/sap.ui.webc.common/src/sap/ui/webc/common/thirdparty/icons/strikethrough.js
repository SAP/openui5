sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/strikethrough", "./v5/strikethrough"], function (_exports, _Theme, _strikethrough, _strikethrough2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _strikethrough.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _strikethrough.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _strikethrough.pathData : _strikethrough2.pathData;
  _exports.pathData = pathData;
  var _default = "strikethrough";
  _exports.default = _default;
});