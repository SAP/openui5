sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/user", "./v3/user"], function (_exports, _Theme, _user, _user2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _user.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _user.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _user.pathData : _user2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/user";
  _exports.default = _default;
});