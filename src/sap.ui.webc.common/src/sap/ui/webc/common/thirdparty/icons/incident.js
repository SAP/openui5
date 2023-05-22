sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/incident", "./v5/incident"], function (_exports, _Theme, _incident, _incident2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _incident.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _incident.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _incident.pathData : _incident2.pathData;
  _exports.pathData = pathData;
  var _default = "incident";
  _exports.default = _default;
});