sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/goal", "./v4/goal"], function (_exports, _Theme, _goal, _goal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _goal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _goal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _goal.pathData : _goal2.pathData;
  _exports.pathData = pathData;
  var _default = "goal";
  _exports.default = _default;
});