sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/sub-content", "./v3/sub-content"], function (_exports, _Theme, _subContent, _subContent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _subContent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _subContent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _subContent.pathData : _subContent2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/sub-content";
  _exports.default = _default;
});