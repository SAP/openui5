sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/start-event", "./v3/start-event"], function (_exports, _Theme, _startEvent, _startEvent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _startEvent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _startEvent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _startEvent.pathData : _startEvent2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/start-event";
  _exports.default = _default;
});