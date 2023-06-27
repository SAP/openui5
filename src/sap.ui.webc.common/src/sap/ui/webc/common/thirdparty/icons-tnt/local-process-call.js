sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/local-process-call", "./v3/local-process-call"], function (_exports, _Theme, _localProcessCall, _localProcessCall2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _localProcessCall.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _localProcessCall.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _localProcessCall.pathData : _localProcessCall2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/local-process-call";
  _exports.default = _default;
});