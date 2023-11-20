sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "separator";
  const pathData = "M92 336c12 1 21 12 21 24v96c0 13-11 24-24 24s-24-11-24-24v-78c-28-12-48-40-48-72V175c0-42 35-77 77-77h66V26c0-14 11-24 24-24s24 10 24 24v96c0 13-11 23-24 23H94c-16 0-29 14-29 30v131c0 15 12 28 27 30zm92 1h144c14 0 24 9 24 23v96c0 13-10 24-24 24-13 0-24-11-24-24v-72h-96v72c0 13-11 24-24 24s-24-11-24-24v-96c0-14 11-23 24-23zM352 98h66c42 0 77 35 77 77v131c0 32-20 60-48 72v78c0 13-11 24-24 24s-24-11-24-24v-96c0-12 9-23 21-24 15-2 27-15 27-30V175c0-16-13-30-29-30h-90c-13 0-24-11-24-24V26c0-14 11-24 24-24 14 0 24 10 24 24v72z";
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
  var _default = "business-suite-v2/separator";
  _exports.default = _default;
});