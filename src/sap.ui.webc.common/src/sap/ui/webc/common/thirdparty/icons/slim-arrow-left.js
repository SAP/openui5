sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/slim-arrow-left", "./v5/slim-arrow-left"], function (_exports, _Theme, _slimArrowLeft, _slimArrowLeft2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _slimArrowLeft.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _slimArrowLeft.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _slimArrowLeft.pathData : _slimArrowLeft2.pathData;
  _exports.pathData = pathData;
  var _default = "slim-arrow-left";
  _exports.default = _default;
});