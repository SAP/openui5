sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/my-view", "./v5/my-view"], function (_exports, _Theme, _myView, _myView2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _myView.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _myView.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _myView.pathData : _myView2.pathData;
  _exports.pathData = pathData;
  var _default = "my-view";
  _exports.default = _default;
});