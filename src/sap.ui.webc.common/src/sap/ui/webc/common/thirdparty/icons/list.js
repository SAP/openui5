sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/list", "./v5/list"], function (_exports, _Theme, _list, _list2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _list.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _list.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _list.pathData : _list2.pathData;
  _exports.pathData = pathData;
  var _default = "list";
  _exports.default = _default;
});