sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/vertical-grip", "./v5/vertical-grip"], function (_exports, _Theme, _verticalGrip, _verticalGrip2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _verticalGrip.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _verticalGrip.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _verticalGrip.pathData : _verticalGrip2.pathData;
  _exports.pathData = pathData;
  var _default = "vertical-grip";
  _exports.default = _default;
});