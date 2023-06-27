sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/cluster-chained", "./v2/cluster-chained"], function (_exports, _Theme, _clusterChained, _clusterChained2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _clusterChained.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _clusterChained.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _clusterChained.pathData : _clusterChained2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/cluster-chained";
  _exports.default = _default;
});