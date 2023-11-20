sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/step", "./v5/step"], function (_exports, _Theme, _step, _step2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _step.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _step.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _step.pathData : _step2.pathData;
  _exports.pathData = pathData;
  var _default = "step";
  _exports.default = _default;
});