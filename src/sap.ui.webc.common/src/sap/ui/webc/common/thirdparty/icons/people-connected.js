sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/people-connected", "./v5/people-connected"], function (_exports, _Theme, _peopleConnected, _peopleConnected2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _peopleConnected.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _peopleConnected.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _peopleConnected.pathData : _peopleConnected2.pathData;
  _exports.pathData = pathData;
  var _default = "people-connected";
  _exports.default = _default;
});