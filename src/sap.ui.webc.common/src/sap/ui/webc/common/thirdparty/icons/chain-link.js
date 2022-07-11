sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/chain-link", "./v4/chain-link"], function (_exports, _Theme, _chainLink, _chainLink2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _chainLink.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _chainLink.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _chainLink.pathData : _chainLink2.pathData;
  _exports.pathData = pathData;
  var _default = "chain-link";
  _exports.default = _default;
});