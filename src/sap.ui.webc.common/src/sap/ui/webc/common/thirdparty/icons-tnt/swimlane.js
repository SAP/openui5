sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/swimlane", "./v3/swimlane"], function (_exports, _Theme, _swimlane, _swimlane2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _swimlane.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _swimlane.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _swimlane.pathData : _swimlane2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/swimlane";
  _exports.default = _default;
});