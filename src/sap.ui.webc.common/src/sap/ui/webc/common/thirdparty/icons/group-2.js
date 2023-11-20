sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/group-2", "./v5/group-2"], function (_exports, _Theme, _group, _group2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _group.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _group.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _group.pathData : _group2.pathData;
  _exports.pathData = pathData;
  var _default = "group-2";
  _exports.default = _default;
});