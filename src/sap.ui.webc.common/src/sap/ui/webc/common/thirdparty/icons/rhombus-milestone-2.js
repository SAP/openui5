sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/rhombus-milestone-2", "./v5/rhombus-milestone-2"], function (_exports, _Theme, _rhombusMilestone, _rhombusMilestone2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _rhombusMilestone.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _rhombusMilestone.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _rhombusMilestone.pathData : _rhombusMilestone2.pathData;
  _exports.pathData = pathData;
  var _default = "rhombus-milestone-2";
  _exports.default = _default;
});