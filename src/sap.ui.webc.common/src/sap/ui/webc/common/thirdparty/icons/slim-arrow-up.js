sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/slim-arrow-up", "./v5/slim-arrow-up"], function (_exports, _Theme, _slimArrowUp, _slimArrowUp2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _slimArrowUp.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _slimArrowUp.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _slimArrowUp.pathData : _slimArrowUp2.pathData;
  _exports.pathData = pathData;
  var _default = "slim-arrow-up";
  _exports.default = _default;
});