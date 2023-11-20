sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/inbox", "./v5/inbox"], function (_exports, _Theme, _inbox, _inbox2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _inbox.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _inbox.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _inbox.pathData : _inbox2.pathData;
  _exports.pathData = pathData;
  var _default = "inbox";
  _exports.default = _default;
});