sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/official-service-group", "./v2/official-service-group"], function (_exports, _Theme, _officialServiceGroup, _officialServiceGroup2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _officialServiceGroup.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _officialServiceGroup.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _officialServiceGroup.pathData : _officialServiceGroup2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/official-service-group";
  _exports.default = _default;
});