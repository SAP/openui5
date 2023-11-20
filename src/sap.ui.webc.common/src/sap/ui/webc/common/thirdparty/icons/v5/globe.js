sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "globe";
  const pathData = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm146 400q27-28 43-65t16-79q0-34-10.5-65t-29-56T377 91t-57-29v41q0 11-7 18t-18 7h-71v39q0 11-7 18t-18 7h-42l54 64h84q11 0 18 7.5t7 18.5v70h7q25 0 44.5 13.5T402 400zM51 256q0 39 14 74t38 62 57 44.5 71 22.5v-53q-26-8-43.5-28.5T167 331L56 212q-5 23-5 44z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "SAP-icons-v5/globe";
  _exports.default = _default;
});