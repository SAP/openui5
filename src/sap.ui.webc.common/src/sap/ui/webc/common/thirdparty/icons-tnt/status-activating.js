sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/status-activating", "./v3/status-activating"], function (_exports, _Theme, _statusActivating, _statusActivating2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusActivating.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusActivating.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _statusActivating.pathData : _statusActivating2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/status-activating";
  _exports.default = _default;
});