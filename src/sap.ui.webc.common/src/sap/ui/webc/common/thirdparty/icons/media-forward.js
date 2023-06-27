sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/media-forward", "./v5/media-forward"], function (_exports, _Theme, _mediaForward, _mediaForward2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mediaForward.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mediaForward.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mediaForward.pathData : _mediaForward2.pathData;
  _exports.pathData = pathData;
  var _default = "media-forward";
  _exports.default = _default;
});