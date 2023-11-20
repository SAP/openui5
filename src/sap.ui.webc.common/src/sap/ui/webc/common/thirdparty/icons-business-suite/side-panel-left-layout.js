sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/side-panel-left-layout", "./v2/side-panel-left-layout"], function (_exports, _Theme, _sidePanelLeftLayout, _sidePanelLeftLayout2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sidePanelLeftLayout.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sidePanelLeftLayout.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sidePanelLeftLayout.pathData : _sidePanelLeftLayout2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/side-panel-left-layout";
  _exports.default = _default;
});