sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/submission", "./v2/submission"], function (_exports, _Theme, _submission, _submission2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _submission.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _submission.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _submission.pathData : _submission2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/submission";
  _exports.default = _default;
});