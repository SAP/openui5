sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/master-task-triangle-2", "./v5/master-task-triangle-2"], function (_exports, _Theme, _masterTaskTriangle, _masterTaskTriangle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _masterTaskTriangle.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _masterTaskTriangle.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _masterTaskTriangle.pathData : _masterTaskTriangle2.pathData;
  _exports.pathData = pathData;
  var _default = "master-task-triangle-2";
  _exports.default = _default;
});