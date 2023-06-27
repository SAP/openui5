sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/slim-arrow-down", "./v5/slim-arrow-down"], function (_exports, _Theme, _slimArrowDown, _slimArrowDown2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _slimArrowDown.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _slimArrowDown.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _slimArrowDown.pathData : _slimArrowDown2.pathData;
  _exports.pathData = pathData;
  var _default = "slim-arrow-down";
  _exports.default = _default;
});