sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/progress-group", "./v3/progress-group"], function (_exports, _Theme, _progressGroup, _progressGroup2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _progressGroup.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _progressGroup.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _progressGroup.pathData : _progressGroup2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/progress-group";
  _exports.default = _default;
});