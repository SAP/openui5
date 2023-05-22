sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "table-column";
  const pathData = "M410 32q29 0 49.5 20.5T480 102v309q0 29-20.5 49T410 480H102q-29 0-49.5-20T32 411V102q0-29 20.5-49.5T102 32h308zM83 297h81v-81H83v81zm265 0h81v-81h-81v81zm81-195q0-8-5.5-13.5T410 83h-62v82h81v-63zM102 83q-8 0-13.5 5.5T83 102v63h81V83h-62zM83 411q0 8 5.5 13t13.5 5h62v-81H83v63zm327 18q8 0 13.5-5t5.5-13v-63h-81v81h62z";
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
  var _default = "SAP-icons-v5/table-column";
  _exports.default = _default;
});