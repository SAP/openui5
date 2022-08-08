sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "fallback";
  const pathData = "M487 225q-26 0-26-26v-51q0-25-26-25H256q-10 0-18-8l-43-44H77q-11 0-18.5 7.5T51 97v307q0 12 7.5 19t18.5 7h358q26 0 26-26v-25q0-33-22-55t-55-22H215l34 33q8 8 8 18t-8 18-18 8-18-8l-77-77q-8-8-8-18t8-18l77-77q8-8 18-8t18 8 8 18-8 18l-34 34h169q27 0 50.5 10t40.5 27 27 40.5 10 50.5v25q0 33-22 55t-55 22H77q-32 0-54.5-22T0 404V97q0-33 22.5-55T77 20h128q10 0 18 8l44 43h168q33 0 55 22.5t22 54.5v51q0 26-25 26z";
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
  var _default = "fallback";
  _exports.default = _default;
});