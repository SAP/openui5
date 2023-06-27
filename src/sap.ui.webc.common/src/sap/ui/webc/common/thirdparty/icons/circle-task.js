sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/circle-task", "./v5/circle-task"], function (_exports, _Theme, _circleTask, _circleTask2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _circleTask.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _circleTask.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _circleTask.pathData : _circleTask2.pathData;
  _exports.pathData = pathData;
  var _default = "circle-task";
  _exports.default = _default;
});