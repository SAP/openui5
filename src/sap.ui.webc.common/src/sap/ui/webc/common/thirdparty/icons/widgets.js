sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/widgets", "./v5/widgets"], function (_exports, _Theme, _widgets, _widgets2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _widgets.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _widgets.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _widgets.pathData : _widgets2.pathData;
  _exports.pathData = pathData;
  var _default = "widgets";
  _exports.default = _default;
});