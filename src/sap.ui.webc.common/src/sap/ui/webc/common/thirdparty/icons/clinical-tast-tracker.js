sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/clinical-tast-tracker", "./v5/clinical-tast-tracker"], function (_exports, _Theme, _clinicalTastTracker, _clinicalTastTracker2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _clinicalTastTracker.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _clinicalTastTracker.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _clinicalTastTracker.pathData : _clinicalTastTracker2.pathData;
  _exports.pathData = pathData;
  var _default = "clinical-tast-tracker";
  _exports.default = _default;
});