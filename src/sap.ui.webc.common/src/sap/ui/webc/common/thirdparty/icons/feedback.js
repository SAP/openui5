sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/feedback", "./v4/feedback"], function (_exports, _Theme, _feedback, _feedback2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _feedback.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _feedback.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _feedback.pathData : _feedback2.pathData;
  _exports.pathData = pathData;
  var _default = "feedback";
  _exports.default = _default;
});