sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "image-viewer";
  const pathData = "M512 326q0 38-26 64t-64 26H186q-38 0-64-26t-26-64V90q0-38 26-64t64-26h255q29 0 50 21t21 50v255zM186 51q-17 0-28 11t-11 28v236l84-93q8-9 19-9 9 0 16 6l33 28 82-90q8-8 19-8 8 0 15 5l46 34V71q0-8-6-14t-14-6H186zm204 410q11 0 18.5 7t7.5 18-7.5 18.5T390 512H90q-38 0-64-26T0 422V122q0-11 7.5-18.5T26 96t18 7.5 7 18.5v300q0 17 11 28t28 11h300zM224 160q-14 0-23-9t-9-23 9-23 23-9 23 9 9 23-9 23-23 9zm198 205q17 0 28-11t11-28v-64l-58-42-64 70 4 4q9 7 9 20 0 10-7.5 17.5T326 339q-8 0-16-6l-58-48-71 80h241z";
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
  var _default = "SAP-icons-v5/image-viewer";
  _exports.default = _default;
});