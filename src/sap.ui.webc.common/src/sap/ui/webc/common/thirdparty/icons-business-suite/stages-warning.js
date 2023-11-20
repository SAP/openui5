sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/stages-warning", "./v2/stages-warning"], function (_exports, _Theme, _stagesWarning, _stagesWarning2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _stagesWarning.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _stagesWarning.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _stagesWarning.pathData : _stagesWarning2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/stages-warning";
  _exports.default = _default;
});