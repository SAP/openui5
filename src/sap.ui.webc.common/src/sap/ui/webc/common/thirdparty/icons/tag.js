sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/tag", "./v5/tag"], function (_exports, _Theme, _tag, _tag2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tag.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tag.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tag.pathData : _tag2.pathData;
  _exports.pathData = pathData;
  var _default = "tag";
  _exports.default = _default;
});