sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/incoming-call", "./v5/incoming-call"], function (_exports, _Theme, _incomingCall, _incomingCall2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _incomingCall.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _incomingCall.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _incomingCall.pathData : _incomingCall2.pathData;
  _exports.pathData = pathData;
  var _default = "incoming-call";
  _exports.default = _default;
});