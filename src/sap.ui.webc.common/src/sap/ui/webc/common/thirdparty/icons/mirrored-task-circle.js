sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/mirrored-task-circle", "./v5/mirrored-task-circle"], function (_exports, _Theme, _mirroredTaskCircle, _mirroredTaskCircle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mirroredTaskCircle.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mirroredTaskCircle.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mirroredTaskCircle.pathData : _mirroredTaskCircle2.pathData;
  _exports.pathData = pathData;
  var _default = "mirrored-task-circle";
  _exports.default = _default;
});