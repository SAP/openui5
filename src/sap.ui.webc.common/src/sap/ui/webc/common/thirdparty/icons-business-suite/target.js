sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/target", "./v2/target"], function (_exports, _Theme, _target, _target2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _target.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _target.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _target.pathData : _target2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/target";
  _exports.default = _default;
});