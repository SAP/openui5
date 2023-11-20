sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "exit-full-screen";
  const pathData = "M319.253 159.377V18.927q0-16.935 15.938-17.93 5.976.995 10.957 5.478t4.98 11.455v117.54L482.615 4.98Q487.595 0 494.568 0t11.953 3.984q10.958 12.95 0 23.907L372.047 160.374h122.521q13.946 0 15.938 13.945 0 16.934-15.938 17.93h-143.44q-13.945 0-22.91-9.463t-8.965-23.409zM5.479 483.113l133.478-131.487H16.436q-13.946 0-15.938-13.945 0-16.934 15.938-17.93h143.44q13.945 0 22.91 9.463t8.965 23.409v140.45q0 16.935-15.938 17.93-5.976-.995-10.957-5.478t-4.98-11.455V376.53L29.385 506.022q-4.981 4.98-11.954 4.98T5.479 507.02q-10.958-12.949 0-23.906zm441.276-35.86V256h31.875v191.253q0 12.95-8.965 22.412t-22.91 9.463H255.502v-31.875h191.253zM64.249 256H32.374V64.747q0-13.945 9.463-22.91t22.412-8.965h191.253v31.875H64.249V256z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_EXIT_FULL_SCREEN;
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
  var _default = "SAP-icons-v4/exit-full-screen";
  _exports.default = _default;
});