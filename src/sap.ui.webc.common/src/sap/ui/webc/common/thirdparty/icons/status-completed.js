sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/status-completed", "./v5/status-completed"], function (_exports, _Theme, _statusCompleted, _statusCompleted2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusCompleted.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusCompleted.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _statusCompleted.pathData : _statusCompleted2.pathData;
  _exports.pathData = pathData;
  var _default = "status-completed";
  _exports.default = _default;
});