sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/side-top-panel-layout", "./v2/side-top-panel-layout"], function (_exports, _Theme, _sideTopPanelLayout, _sideTopPanelLayout2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sideTopPanelLayout.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sideTopPanelLayout.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sideTopPanelLayout.pathData : _sideTopPanelLayout2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/side-top-panel-layout";
  _exports.default = _default;
});