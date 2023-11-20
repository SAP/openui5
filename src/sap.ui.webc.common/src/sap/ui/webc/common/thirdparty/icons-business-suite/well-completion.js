sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/well-completion", "./v2/well-completion"], function (_exports, _Theme, _wellCompletion, _wellCompletion2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _wellCompletion.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _wellCompletion.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _wellCompletion.pathData : _wellCompletion2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/well-completion";
  _exports.default = _default;
});