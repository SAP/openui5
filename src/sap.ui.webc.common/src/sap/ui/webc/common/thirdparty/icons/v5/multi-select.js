sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "multi-select";
  const pathData = "M86 152l-47-52q-7-7-7-17 0-11 7.5-18.5T58 57q10 0 19 9l27 30 75-87q8-9 19-9t18.5 7.5T224 26q0 8-6 16l-94 109q-7 9-19 9-11 0-19-8zm368-56H282q-11 0-18.5-7.5T256 70t7.5-18 18.5-7h172q11 0 18.5 7t7.5 18-7.5 18.5T454 96zM86 312l-47-52q-7-7-7-17 0-11 7.5-18.5T58 217q10 0 19 9l27 30 75-87q8-9 19-9t18.5 7.5T224 186q0 8-6 16l-94 109q-7 9-19 9-11 0-19-8zm368-30H282q-11 0-18.5-7.5T256 256t7.5-18.5T282 230h172q11 0 18.5 7.5T480 256t-7.5 18.5T454 282zM166 512H58q-11 0-18.5-7.5T32 486V378q0-11 7.5-18.5T58 352h108q11 0 18.5 7.5T192 378v108q0 11-7.5 18.5T166 512zm-83-51h58v-58H83v58zm371 6H282q-11 0-18.5-7t-7.5-18 7.5-18.5T282 416h172q11 0 18.5 7.5T480 442t-7.5 18-18.5 7z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_MULTI_SELECT;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "SAP-icons-v5/multi-select";
  _exports.default = _default;
});