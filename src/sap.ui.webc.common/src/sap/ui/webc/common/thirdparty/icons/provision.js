sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/provision", "./v5/provision"], function (_exports, _Theme, _provision, _provision2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _provision.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _provision.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _provision.pathData : _provision2.pathData;
  _exports.pathData = pathData;
  var _default = "provision";
  _exports.default = _default;
});