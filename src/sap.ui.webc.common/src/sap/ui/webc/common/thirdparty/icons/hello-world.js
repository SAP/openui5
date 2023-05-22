sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/hello-world", "./v5/hello-world"], function (_exports, _Theme, _helloWorld, _helloWorld2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _helloWorld.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _helloWorld.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _helloWorld.pathData : _helloWorld2.pathData;
  _exports.pathData = pathData;
  var _default = "hello-world";
  _exports.default = _default;
});