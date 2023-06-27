sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/collections-management", "./v5/collections-management"], function (_exports, _Theme, _collectionsManagement, _collectionsManagement2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _collectionsManagement.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _collectionsManagement.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _collectionsManagement.pathData : _collectionsManagement2.pathData;
  _exports.pathData = pathData;
  var _default = "collections-management";
  _exports.default = _default;
});