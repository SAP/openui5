sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/throwing-message", "./v3/throwing-message"], function (_exports, _Theme, _throwingMessage, _throwingMessage2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _throwingMessage.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _throwingMessage.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _throwingMessage.pathData : _throwingMessage2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/throwing-message";
  _exports.default = _default;
});