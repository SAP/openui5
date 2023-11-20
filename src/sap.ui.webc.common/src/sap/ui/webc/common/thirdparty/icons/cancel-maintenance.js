sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/cancel-maintenance", "./v5/cancel-maintenance"], function (_exports, _Theme, _cancelMaintenance, _cancelMaintenance2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cancelMaintenance.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cancelMaintenance.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _cancelMaintenance.pathData : _cancelMaintenance2.pathData;
  _exports.pathData = pathData;
  var _default = "cancel-maintenance";
  _exports.default = _default;
});