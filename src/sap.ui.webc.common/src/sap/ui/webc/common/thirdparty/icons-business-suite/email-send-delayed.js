sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/email-send-delayed", "./v2/email-send-delayed"], function (_exports, _Theme, _emailSendDelayed, _emailSendDelayed2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _emailSendDelayed.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _emailSendDelayed.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _emailSendDelayed.pathData : _emailSendDelayed2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/email-send-delayed";
  _exports.default = _default;
});