sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/message-start-event", "./v3/message-start-event"], function (_exports, _Theme, _messageStartEvent, _messageStartEvent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _messageStartEvent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _messageStartEvent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _messageStartEvent.pathData : _messageStartEvent2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/message-start-event";
  _exports.default = _default;
});