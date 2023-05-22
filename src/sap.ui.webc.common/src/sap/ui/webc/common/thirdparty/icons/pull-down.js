sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/pull-down", "./v5/pull-down"], function (_exports, _Theme, _pullDown, _pullDown2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pullDown.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pullDown.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pullDown.pathData : _pullDown2.pathData;
  _exports.pathData = pathData;
  var _default = "pull-down";
  _exports.default = _default;
});