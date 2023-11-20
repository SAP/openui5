sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/add-polygone", "./v2/add-polygone"], function (_exports, _Theme, _addPolygone, _addPolygone2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _addPolygone.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _addPolygone.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _addPolygone.pathData : _addPolygone2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/add-polygone";
  _exports.default = _default;
});