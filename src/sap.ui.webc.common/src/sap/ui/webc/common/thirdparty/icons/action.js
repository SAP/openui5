sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/action", "./v5/action"], function (_exports, _Theme, _action, _action2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _action.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _action.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _action.pathData : _action2.pathData;
  _exports.pathData = pathData;
  var _default = "action";
  _exports.default = _default;
});