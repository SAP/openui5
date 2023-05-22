sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/milestone", "./v2/milestone"], function (_exports, _Theme, _milestone, _milestone2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _milestone.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _milestone.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _milestone.pathData : _milestone2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/milestone";
  _exports.default = _default;
});