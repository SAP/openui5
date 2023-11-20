sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/flow", "./v3/flow"], function (_exports, _Theme, _flow, _flow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _flow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _flow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _flow.pathData : _flow2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/flow";
  _exports.default = _default;
});