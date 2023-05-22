sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/robot", "./v3/robot"], function (_exports, _Theme, _robot, _robot2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _robot.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _robot.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _robot.pathData : _robot2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/robot";
  _exports.default = _default;
});