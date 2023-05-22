sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/message-error", "./v5/message-error"], function (_exports, _Theme, _messageError, _messageError2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _messageError.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _messageError.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _messageError.pathData : _messageError2.pathData;
  _exports.pathData = pathData;
  var _default = "message-error";
  _exports.default = _default;
});