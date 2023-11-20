sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/message-success", "./v5/message-success"], function (_exports, _Theme, _messageSuccess, _messageSuccess2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _messageSuccess.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _messageSuccess.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _messageSuccess.pathData : _messageSuccess2.pathData;
  _exports.pathData = pathData;
  var _default = "message-success";
  _exports.default = _default;
});