sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/journey-arrive", "./v5/journey-arrive"], function (_exports, _Theme, _journeyArrive, _journeyArrive2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _journeyArrive.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _journeyArrive.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _journeyArrive.pathData : _journeyArrive2.pathData;
  _exports.pathData = pathData;
  var _default = "journey-arrive";
  _exports.default = _default;
});