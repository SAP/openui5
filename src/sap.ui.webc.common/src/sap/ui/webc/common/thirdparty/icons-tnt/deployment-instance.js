sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/deployment-instance", "./v3/deployment-instance"], function (_exports, _Theme, _deploymentInstance, _deploymentInstance2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _deploymentInstance.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _deploymentInstance.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _deploymentInstance.pathData : _deploymentInstance2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/deployment-instance";
  _exports.default = _default;
});