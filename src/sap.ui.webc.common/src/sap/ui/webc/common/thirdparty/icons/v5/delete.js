sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "delete";
  const pathData = "M205 205q11 0 18.5 7t7.5 19v153q0 11-7.5 18.5T205 410t-18-7.5-7-18.5V231q0-26 25-26zm102 0q26 0 26 26v153q0 11-7 18.5t-19 7.5q-11 0-18-7.5t-7-18.5V231q0-26 25-26zm154-102q25 0 25 26 0 25-25 25h-26v281q0 33-22 55t-55 22H154q-32 0-54.5-22T77 435V154H52q-26 0-26-25 0-26 26-26h76V77q0-32 22.5-54T205 1h102q33 0 55 22t22 54v26h77zm-281 0h153V77q0-25-26-25H205q-25 0-25 25v26zm204 51H128v281q0 12 7.5 19t18.5 7h204q26 0 26-26V154z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DELETE;
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
  var _default = "delete";
  _exports.default = _default;
});