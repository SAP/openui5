sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/tags", "./v5/tags"], function (_exports, _Theme, _tags, _tags2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tags.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tags.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tags.pathData : _tags2.pathData;
  _exports.pathData = pathData;
  var _default = "tags";
  _exports.default = _default;
});