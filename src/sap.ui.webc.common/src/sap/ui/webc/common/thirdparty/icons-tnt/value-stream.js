sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/value-stream", "./v3/value-stream"], function (_exports, _Theme, _valueStream, _valueStream2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _valueStream.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _valueStream.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _valueStream.pathData : _valueStream2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/value-stream";
  _exports.default = _default;
});