sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/content-enricher", "./v3/content-enricher"], function (_exports, _Theme, _contentEnricher, _contentEnricher2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _contentEnricher.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _contentEnricher.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _contentEnricher.pathData : _contentEnricher2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/content-enricher";
  _exports.default = _default;
});