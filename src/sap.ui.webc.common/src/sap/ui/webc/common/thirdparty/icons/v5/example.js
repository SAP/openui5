sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "example";
  const pathData = "M256 192q-40 0-68-28t-28-68 28-68 68-28 68 28 28 68-28 68-68 28zm-64 64q0 41-27.5 68.5T96 352t-68.5-27.5T0 256t27.5-68.5T96 160t68.5 27.5T192 256zm224-96q41 0 68.5 27.5T512 256t-27.5 68.5T416 352t-68.5-27.5T320 256t27.5-68.5T416 160zM96 301q20 0 32.5-12.5T141 256t-12.5-32.5T96 211t-32.5 12.5T51 256t12.5 32.5T96 301zm320 0q20 0 32.5-12.5T461 256t-12.5-32.5T416 211t-32.5 12.5T371 256t12.5 32.5T416 301zm-160 19q41 0 68.5 27.5T352 416t-27.5 68.5T256 512t-68.5-27.5T160 416t27.5-68.5T256 320zm0 141q20 0 32.5-12.5T301 416t-12.5-32.5T256 371t-32.5 12.5T211 416t12.5 32.5T256 461z";
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
  var _default = "SAP-icons-v5/example";
  _exports.default = _default;
});