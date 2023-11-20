sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "text";
  const pathData = "M454 32q11 0 18.5 7.5T480 58v76q0 11-7.5 18.5T454 160t-18-7.5-7-18.5V83H282v346h44q11 0 18.5 7t7.5 18-7.5 18.5T326 480H186q-11 0-18.5-7.5T160 454t7.5-18 18.5-7h44V83H83v51q0 11-7 18.5T58 160t-18.5-7.5T32 134V58q0-11 7.5-18.5T58 32h396z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v5/text";
  _exports.default = _default;
});