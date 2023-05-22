sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/endoscopy", "./v5/endoscopy"], function (_exports, _Theme, _endoscopy, _endoscopy2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _endoscopy.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _endoscopy.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _endoscopy.pathData : _endoscopy2.pathData;
  _exports.pathData = pathData;
  var _default = "endoscopy";
  _exports.default = _default;
});