sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/consumer", "./v2/consumer"], function (_exports, _Theme, _consumer, _consumer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _consumer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _consumer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _consumer.pathData : _consumer2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/consumer";
  _exports.default = _default;
});