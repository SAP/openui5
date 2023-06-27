sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "table-view";
  const pathData = "M410 32q29 0 49.5 20.5T480 102v308q0 29-20.5 49.5T410 480H101q-29 0-49-20.5T32 410V102q0-29 20-49.5T101 32h309zM297 297v-82h-82v82h82zm-82 51v81h82v-81h-82zM83 297h81v-82H83v82zm214-133V83h-82v81h82zm51 133h81v-82h-81v82zm81-195q0-19-19-19h-62v81h81v-62zM101 83q-8 0-13 5.5T83 102v62h81V83h-63zM83 410q0 8 5 13.5t13 5.5h63v-81H83v62zm327 19q19 0 19-19v-62h-81v81h62z";
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
  var _default = "SAP-icons-v5/table-view";
  _exports.default = _default;
});