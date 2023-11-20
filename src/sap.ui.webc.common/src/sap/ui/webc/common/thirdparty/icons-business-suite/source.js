sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/source", "./v2/source"], function (_exports, _Theme, _source, _source2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _source.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _source.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _source.pathData : _source2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/source";
  _exports.default = _default;
});