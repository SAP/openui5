sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/alert-groups", "./v2/alert-groups"], function (_exports, _Theme, _alertGroups, _alertGroups2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _alertGroups.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _alertGroups.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _alertGroups.pathData : _alertGroups2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/alert-groups";
  _exports.default = _default;
});