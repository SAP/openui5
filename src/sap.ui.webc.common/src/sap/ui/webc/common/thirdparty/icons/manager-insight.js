sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/manager-insight", "./v5/manager-insight"], function (_exports, _Theme, _managerInsight, _managerInsight2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _managerInsight.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _managerInsight.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _managerInsight.pathData : _managerInsight2.pathData;
  _exports.pathData = pathData;
  var _default = "manager-insight";
  _exports.default = _default;
});