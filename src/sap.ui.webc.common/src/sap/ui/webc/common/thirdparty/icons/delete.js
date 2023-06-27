sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/delete", "./v5/delete"], function (_exports, _Theme, _delete, _delete2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _delete.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _delete.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _delete.pathData : _delete2.pathData;
  _exports.pathData = pathData;
  var _default = "delete";
  _exports.default = _default;
});