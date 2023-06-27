sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/journey-change", "./v5/journey-change"], function (_exports, _Theme, _journeyChange, _journeyChange2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _journeyChange.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _journeyChange.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _journeyChange.pathData : _journeyChange2.pathData;
  _exports.pathData = pathData;
  var _default = "journey-change";
  _exports.default = _default;
});