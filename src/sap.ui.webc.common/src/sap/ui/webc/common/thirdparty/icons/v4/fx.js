sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "fx";
  const pathData = "M32 480l125-288h-30l10-32h33l27-62q13-29 32-47.5T281 32h39l-10 32h-27q-15 0-25 10-11 7-19 27l-26 59h102l44 92 76-92h45L379 278l54 106h-40l-41-84-70 83h-45l95-110-41-81h-92L72 480H32z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "SAP-icons-v4/fx";
  _exports.default = _default;
});