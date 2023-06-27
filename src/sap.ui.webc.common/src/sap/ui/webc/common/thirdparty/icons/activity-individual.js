sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/activity-individual", "./v5/activity-individual"], function (_exports, _Theme, _activityIndividual, _activityIndividual2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _activityIndividual.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _activityIndividual.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _activityIndividual.pathData : _activityIndividual2.pathData;
  _exports.pathData = pathData;
  var _default = "activity-individual";
  _exports.default = _default;
});