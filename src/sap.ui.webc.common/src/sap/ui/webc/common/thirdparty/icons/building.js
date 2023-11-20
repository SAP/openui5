sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/building", "./v5/building"], function (_exports, _Theme, _building, _building2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _building.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _building.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _building.pathData : _building2.pathData;
  _exports.pathData = pathData;
  var _default = "building";
  _exports.default = _default;
});