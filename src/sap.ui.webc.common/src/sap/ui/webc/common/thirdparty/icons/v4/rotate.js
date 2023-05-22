sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "rotate";
  const pathData = "M480 480V224H224v256h256zm16-288q16 0 16 16v288q0 16-16 16H208q-16 0-16-16V208q0-16 16-16h288zM200 59q5 5 5 11 0 5-5 12l-54 54q-5 5-12 5-6 0-11-4.5t-5-11.5q0-5 5-12l27-27H80q-20 0-34 14t-14 34v77q0 16-16 16T0 211v-77q0-33 23.5-56.5T80 54h70l-27-27q-5-5-5-11t5-11q4-5 11-5 8 0 12 5z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/rotate";
  _exports.default = _default;
});