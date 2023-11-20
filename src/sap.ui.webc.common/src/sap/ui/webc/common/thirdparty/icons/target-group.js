sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/target-group", "./v5/target-group"], function (_exports, _Theme, _targetGroup, _targetGroup2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _targetGroup.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _targetGroup.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _targetGroup.pathData : _targetGroup2.pathData;
  _exports.pathData = pathData;
  var _default = "target-group";
  _exports.default = _default;
});