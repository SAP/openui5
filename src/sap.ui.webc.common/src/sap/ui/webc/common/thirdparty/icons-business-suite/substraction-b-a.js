sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/substraction-b-a", "./v2/substraction-b-a"], function (_exports, _Theme, _substractionBA, _substractionBA2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _substractionBA.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _substractionBA.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _substractionBA.pathData : _substractionBA2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/substraction-b-a";
  _exports.default = _default;
});