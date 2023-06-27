sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/database", "./v5/database"], function (_exports, _Theme, _database, _database2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _database.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _database.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _database.pathData : _database2.pathData;
  _exports.pathData = pathData;
  var _default = "database";
  _exports.default = _default;
});