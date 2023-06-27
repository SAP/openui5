sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/mirrored-task", "./v2/mirrored-task"], function (_exports, _Theme, _mirroredTask, _mirroredTask2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mirroredTask.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mirroredTask.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mirroredTask.pathData : _mirroredTask2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/mirrored-task";
  _exports.default = _default;
});