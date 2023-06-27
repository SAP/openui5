sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/use-case", "./v3/use-case"], function (_exports, _Theme, _useCase, _useCase2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _useCase.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _useCase.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _useCase.pathData : _useCase2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/use-case";
  _exports.default = _default;
});