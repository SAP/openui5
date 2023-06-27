sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "rotate";
  const pathData = "M461 461V243H243v218h218zm25-269q11 0 18.5 7.5T512 218v268q0 11-7.5 18.5T486 512H218q-11 0-18.5-7.5T192 486V218q0-11 7.5-18.5T218 192h268zM217 62q7 7 7 18 0 10-8 18l-54 54q-7 8-18 8t-18.5-7.5T118 134q0-10 8-18l11-10H90q-17 0-28 11t-11 27v77q0 11-7 18t-18 7-18.5-7T0 221v-77q0-37 26-63.5T90 54h47l-11-10q-8-8-8-18 0-11 8-19 9-7 18-7 11 0 18 8z";
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