sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/note-connection", "./v3/note-connection"], function (_exports, _Theme, _noteConnection, _noteConnection2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _noteConnection.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _noteConnection.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _noteConnection.pathData : _noteConnection2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/note-connection";
  _exports.default = _default;
});