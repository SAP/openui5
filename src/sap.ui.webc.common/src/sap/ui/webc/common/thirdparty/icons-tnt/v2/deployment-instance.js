sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "deployment-instance";
  const pathData = "M64 32h385q13 0 22 9t9 23v176h-32V64H64v384h192v32H64q-13 0-22.5-8.5T32 449V64q0-14 9-23t23-9zm226 320q3-17 11-29l-23-24 22-21 24 22q7-4 13.5-6.5T352 290v-34h32v33q7 1 15 3.5t14 7.5l24-22 21 21-22 24q5 6 7 13.5t4 15.5h33v32h-33q-3 13-11 28l23 24-22 22-24-23q-12 8-29 11v34h-32v-34q-13-3-28-11l-24 23-22-22 23-24q-4-7-6.5-13.5T290 384h-34v-32h34zm34 32q3 9 10.5 17.5T352 413q8 3 16 3 9 0 16-3 23-6 29-29 3-8 3-16 0-14-9-27t-23-18q-7-3-16-3-19 0-33 14.5T321 368q0 8 3 16z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "tnt-v2";
  const packageName = "@ui5/webcomponents-icons-tnt";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "tnt-v2/deployment-instance";
  _exports.default = _default;
});