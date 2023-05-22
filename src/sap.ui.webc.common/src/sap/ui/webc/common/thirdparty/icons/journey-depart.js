sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/journey-depart", "./v5/journey-depart"], function (_exports, _Theme, _journeyDepart, _journeyDepart2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _journeyDepart.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _journeyDepart.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _journeyDepart.pathData : _journeyDepart2.pathData;
  _exports.pathData = pathData;
  var _default = "journey-depart";
  _exports.default = _default;
});