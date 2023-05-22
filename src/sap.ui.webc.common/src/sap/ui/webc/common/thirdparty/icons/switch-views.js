sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/switch-views", "./v5/switch-views"], function (_exports, _Theme, _switchViews, _switchViews2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _switchViews.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _switchViews.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _switchViews.pathData : _switchViews2.pathData;
  _exports.pathData = pathData;
  var _default = "switch-views";
  _exports.default = _default;
});