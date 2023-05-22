sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/slim-arrow-right", "./v5/slim-arrow-right"], function (_exports, _Theme, _slimArrowRight, _slimArrowRight2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _slimArrowRight.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _slimArrowRight.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _slimArrowRight.pathData : _slimArrowRight2.pathData;
  _exports.pathData = pathData;
  var _default = "slim-arrow-right";
  _exports.default = _default;
});