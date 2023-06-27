sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/idea-wall", "./v5/idea-wall"], function (_exports, _Theme, _ideaWall, _ideaWall2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _ideaWall.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _ideaWall.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _ideaWall.pathData : _ideaWall2.pathData;
  _exports.pathData = pathData;
  var _default = "idea-wall";
  _exports.default = _default;
});