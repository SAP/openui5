sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/tree", "./v5/tree"], function (_exports, _Theme, _tree, _tree2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tree.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tree.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tree.pathData : _tree2.pathData;
  _exports.pathData = pathData;
  var _default = "tree";
  _exports.default = _default;
});