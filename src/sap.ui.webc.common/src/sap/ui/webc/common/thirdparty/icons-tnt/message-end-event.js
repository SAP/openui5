sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/message-end-event", "./v3/message-end-event"], function (_exports, _Theme, _messageEndEvent, _messageEndEvent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _messageEndEvent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _messageEndEvent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _messageEndEvent.pathData : _messageEndEvent2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/message-end-event";
  _exports.default = _default;
});