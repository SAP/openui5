sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/discussion-2", "./v5/discussion-2"], function (_exports, _Theme, _discussion, _discussion2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _discussion.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _discussion.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _discussion.pathData : _discussion2.pathData;
  _exports.pathData = pathData;
  var _default = "discussion-2";
  _exports.default = _default;
});