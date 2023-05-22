sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/message-popup", "./v5/message-popup"], function (_exports, _Theme, _messagePopup, _messagePopup2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _messagePopup.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _messagePopup.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _messagePopup.pathData : _messagePopup2.pathData;
  _exports.pathData = pathData;
  var _default = "message-popup";
  _exports.default = _default;
});