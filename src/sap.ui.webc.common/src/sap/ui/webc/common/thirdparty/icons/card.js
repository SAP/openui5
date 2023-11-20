sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/card", "./v5/card"], function (_exports, _Theme, _card, _card2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _card.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _card.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _card.pathData : _card2.pathData;
  _exports.pathData = pathData;
  var _default = "card";
  _exports.default = _default;
});