sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/media-pause", "./v5/media-pause"], function (_exports, _Theme, _mediaPause, _mediaPause2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mediaPause.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mediaPause.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mediaPause.pathData : _mediaPause2.pathData;
  _exports.pathData = pathData;
  var _default = "media-pause";
  _exports.default = _default;
});