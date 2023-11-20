sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "fridge";
  const pathData = "M132 0h248q15 0 25.5 11T416 37v443h-32v32h-64v-32H193v32h-65v-32H96V37q0-15 10.5-26T132 0zm252 448V50q0-8-5.5-13T366 32H146q-7 0-12.5 5T128 50v398h256zM321 96v32H192V96h129zm-43 110h73v18h-73v-18z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/fridge";
  _exports.default = _default;
});