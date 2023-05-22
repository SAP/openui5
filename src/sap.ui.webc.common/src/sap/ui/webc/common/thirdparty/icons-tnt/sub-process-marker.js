sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/sub-process-marker", "./v3/sub-process-marker"], function (_exports, _Theme, _subProcessMarker, _subProcessMarker2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _subProcessMarker.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _subProcessMarker.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _subProcessMarker.pathData : _subProcessMarker2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/sub-process-marker";
  _exports.default = _default;
});