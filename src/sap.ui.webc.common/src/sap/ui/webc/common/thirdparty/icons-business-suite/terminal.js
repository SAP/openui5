sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/terminal", "./v2/terminal"], function (_exports, _Theme, _terminal, _terminal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _terminal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _terminal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _terminal.pathData : _terminal2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/terminal";
  _exports.default = _default;
});