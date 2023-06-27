sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/clinical-task-tracker", "./v5/clinical-task-tracker"], function (_exports, _Theme, _clinicalTaskTracker, _clinicalTaskTracker2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _clinicalTaskTracker.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _clinicalTaskTracker.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _clinicalTaskTracker.pathData : _clinicalTaskTracker2.pathData;
  _exports.pathData = pathData;
  var _default = "clinical-task-tracker";
  _exports.default = _default;
});