sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "person-placeholder";
  const pathData = "M342 255q48 23 77 67.5t29 99.5v32q0 11-7.5 18.5T422 480H90q-11 0-18.5-7.5T64 454v-32q0-56 29-100t77-67q-20-18-31-42.5T128 160q0-27 10-50t27.5-40.5 41-27.5T256 32t49.5 10.5 41 28T374 111t10 49q0 27-11 52t-31 43zM256 83q-32 0-54.5 22.5T179 160t22.5 54.5T256 237t54.5-22.5T333 160t-22.5-54.5T256 83zm141 339q0-28-10.5-52.5t-29-42.5-43-28.5T262 288h-12q-28 0-52.5 10.5t-43 28.5-29 42.5T115 422v7h282v-7z";
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
  var _default = "SAP-icons-v5/person-placeholder";
  _exports.default = _default;
});