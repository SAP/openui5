sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/catching-message", "./v3/catching-message"], function (_exports, _Theme, _catchingMessage, _catchingMessage2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _catchingMessage.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _catchingMessage.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _catchingMessage.pathData : _catchingMessage2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/catching-message";
  _exports.default = _default;
});