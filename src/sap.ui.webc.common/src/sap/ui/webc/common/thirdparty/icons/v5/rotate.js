sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "rotate";
  const pathData = "M217 62q7 7 7 18t-7 18l-55 54q-8 8-18 8-11 0-18-7.5t-7-18.5 7-18l11-10H90q-17 0-28 11t-11 27v86q0 11-7 18.5T26 256t-18.5-7.5T0 230v-86q0-37 26-63.5T90 54h47l-11-10q-7-7-7-18t7-18.5T144 0t18 7zm269 130q11 0 18.5 7.5T512 218v268q0 11-7.5 18.5T486 512H218q-11 0-18.5-7.5T192 486V218q0-11 7.5-18.5T218 192h268zm-25 51H243v218h218V243z";
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
  var _default = "SAP-icons-v5/rotate";
  _exports.default = _default;
});