sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "indicator-groups";
  const pathData = "M184 56v66c0 26-21 46-47 46H74l-7 7v274c0 12-11 25-24 25-12 0-23-13-23-25V164c0-5 3-12 7-16L164 7c5-4 11-7 18-7h193c12 0 23 12 23 24v188c0 13-11 24-23 24s-23-11-23-24V47H192zm132 206c97 0 176 80 176 177v17c0 12-11 23-24 23-12 0-23-11-23-23v-17c0-71-58-130-129-130-72 0-130 59-130 130v17c0 12-12 23-24 23-13 0-24-11-24-23v-17c0-97 80-177 178-177zm-10 133l77-45c15-10 33 8 24 23l-46 77c-12 21-41 29-60 15-2-1-4-2-6-4-1-1-3-4-4-5-14-19-5-48 15-61z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v2";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v2/indicator-groups";
  _exports.default = _default;
});