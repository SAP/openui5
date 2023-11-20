sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/checklist-item", "./v2/checklist-item"], function (_exports, _Theme, _checklistItem, _checklistItem2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _checklistItem.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _checklistItem.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _checklistItem.pathData : _checklistItem2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/checklist-item";
  _exports.default = _default;
});