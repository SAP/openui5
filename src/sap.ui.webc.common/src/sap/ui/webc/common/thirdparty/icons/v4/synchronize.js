sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "synchronize";
  const pathData = "M255.5 32q-38 0-72.5 12t-62.5 33.5-49 51-31 63.5h-33q11-41 34.5-76.5t56-61 72.5-40 85-14.5q73 0 132.5 36.5t91.5 96.5V76q1-7 6-11.5t11-3.5q7 0 11 5t4 11v84q-2 14-11.5 22.5t-22.5 8.5l-85-8q-6 0-10.5-5t-4.5-11q2-7 6.5-11.5t11.5-3.5l61 5q-28-56-81.5-91T255.5 32zm0 448q42 0 80-15t67.5-40.5 48.5-60.5 25-76h33q-6 47-28 88t-56 71-77.5 47.5-92.5 17.5q-72 0-131-36t-92-95v55q-1 7-6 11.5t-11 3.5q-7 0-11-5t-4-11v-84q2-14 11.5-22.5t23.5-8.5l84 8q7 0 11 5t4 11q-1 8-6 12t-11 4l-62-6q27 56 80.5 91t119.5 35z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_SYNCHRONIZE;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/synchronize";
  _exports.default = _default;
});