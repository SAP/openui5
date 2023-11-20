sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/personnel-view", "./v5/personnel-view"], function (_exports, _Theme, _personnelView, _personnelView2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _personnelView.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _personnelView.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _personnelView.pathData : _personnelView2.pathData;
  _exports.pathData = pathData;
  var _default = "personnel-view";
  _exports.default = _default;
});