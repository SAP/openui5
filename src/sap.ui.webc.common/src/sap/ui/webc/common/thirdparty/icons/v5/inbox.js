sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "inbox";
  const pathData = "M162 171q-8-6-8-18 0-10 7.5-17.5T180 128t18 7l33 34V25q0-11 7.5-18T257 0t18 7 7 18v144l34-34q6-7 18-7 10 0 17.5 7.5T359 153q0 12-7 18l-77 77q-8 8-18 8-12 0-18-8zM391 64q37 0 63 26t26 63v269q0 38-26 64t-63 26H122q-38 0-64-26t-26-64V153q0-37 26-63t64-26h12q11 0 18.5 7t7.5 18-7.5 18.5T134 115h-12q-17 0-28 11t-11 27v148h97q20 0 25 24 3 17 17.5 28.5T256 365q20 0 34.5-11.5T308 325q5-24 26-24h95V153q0-16-11-27t-27-11h-13q-11 0-18.5-7.5T352 89t7.5-18 18.5-7h13zm0 397q16 0 27-11t11-28v-70h-77q-12 29-38 46.5T256 416t-58-17.5-37-46.5H83v70q0 17 11 28t28 11h269z";
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
  var _default = "SAP-icons-v5/inbox";
  _exports.default = _default;
});