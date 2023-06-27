sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/move", "./v5/move"], function (_exports, _Theme, _move, _move2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _move.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _move.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _move.pathData : _move2.pathData;
  _exports.pathData = pathData;
  var _default = "move";
  _exports.default = _default;
});