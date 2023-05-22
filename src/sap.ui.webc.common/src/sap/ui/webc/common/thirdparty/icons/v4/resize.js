sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "resize";
  const pathData = "M0 338q0-17 16-18 6 1 11 5.5t5 11.5v120q1-1 1.5-2t2.5-3L459 32H336q-14 0-16-14 0-17 16-18h144q14 0 23 9.5t9 23.5v143q0 17-16 18-6-1-11-5.5t-5-11.5V57L55 480h121q14 0 16 14 0 17-16 18H32q-14 0-23-9.5T0 479V338zm288 110h160V288h32v160q0 13-9 22.5t-23 9.5H288v-32zM64 32h160v32H64v160H32V64q0-14 9.5-23T64 32z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_RESIZE;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/resize";
  _exports.default = _default;
});