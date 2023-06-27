sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/requirement-model", "./v2/requirement-model"], function (_exports, _Theme, _requirementModel, _requirementModel2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _requirementModel.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _requirementModel.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _requirementModel.pathData : _requirementModel2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/requirement-model";
  _exports.default = _default;
});