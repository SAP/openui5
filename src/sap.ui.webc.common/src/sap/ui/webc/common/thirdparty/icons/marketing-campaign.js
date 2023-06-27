sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/marketing-campaign", "./v5/marketing-campaign"], function (_exports, _Theme, _marketingCampaign, _marketingCampaign2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _marketingCampaign.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _marketingCampaign.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _marketingCampaign.pathData : _marketingCampaign2.pathData;
  _exports.pathData = pathData;
  var _default = "marketing-campaign";
  _exports.default = _default;
});