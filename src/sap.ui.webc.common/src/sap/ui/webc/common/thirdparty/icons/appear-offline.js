sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/appear-offline", "./v5/appear-offline"], function (_exports, _Theme, _appearOffline, _appearOffline2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _appearOffline.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _appearOffline.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _appearOffline.pathData : _appearOffline2.pathData;
  _exports.pathData = pathData;
  var _default = "appear-offline";
  _exports.default = _default;
});