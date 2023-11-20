sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/sms-send-delayed", "./v2/sms-send-delayed"], function (_exports, _Theme, _smsSendDelayed, _smsSendDelayed2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _smsSendDelayed.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _smsSendDelayed.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _smsSendDelayed.pathData : _smsSendDelayed2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/sms-send-delayed";
  _exports.default = _default;
});