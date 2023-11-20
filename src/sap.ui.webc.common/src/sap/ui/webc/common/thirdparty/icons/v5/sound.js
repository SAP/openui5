sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sound";
  const pathData = "M390 448q-7 0-14-5l-128-91H122q-11 0-18.5-7.5T96 326V186q0-11 7.5-18.5T122 160h126l128-91q7-5 14-5 11 0 18.5 7.5T416 90v332q0 11-7.5 18.5T390 448zM147 301h109q10 0 15 5l94 67V139l-94 67q-7 5-15 5H147v90z";
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
  var _default = "SAP-icons-v5/sound";
  _exports.default = _default;
});