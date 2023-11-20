sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/match-case", "./v2/match-case"], function (_exports, _Theme, _matchCase, _matchCase2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _matchCase.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _matchCase.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _matchCase.pathData : _matchCase2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/match-case";
  _exports.default = _default;
});