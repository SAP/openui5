sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/database-consistency", "./v3/database-consistency"], function (_exports, _Theme, _databaseConsistency, _databaseConsistency2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _databaseConsistency.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _databaseConsistency.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _databaseConsistency.pathData : _databaseConsistency2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/database-consistency";
  _exports.default = _default;
});