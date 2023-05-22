sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "table-row";
  const pathData = "M410 32q29 0 49.5 20.5T480 102v308q0 29-20.5 49.5T410 480H102q-29 0-49.5-20.5T32 410V102q0-29 20.5-49.5T102 32h308zM297 164V83h-82v81h82zm-82 184v81h82v-81h-82zm214-246q0-19-19-19h-62v81h81v-62zM102 83q-19 0-19 19v62h81V83h-62zM83 410q0 19 19 19h62v-81H83v62zm327 19q19 0 19-19v-62h-81v81h62z";
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
  var _default = "SAP-icons-v5/table-row";
  _exports.default = _default;
});