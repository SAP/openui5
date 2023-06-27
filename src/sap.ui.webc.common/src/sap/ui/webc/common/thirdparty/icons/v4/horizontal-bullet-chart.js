sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "horizontal-bullet-chart";
  const pathData = "M104 352h304q8 0 8 8v48q0 8-8 8H104q-8 0-8-8v-48q0-8 8-8zm-8-120q0-8 8-8h240q8 0 8 8v48q0 8-8 8H104q-8 0-8-8v-48zM63 32v448H32V32h31zm33 120v-48q0-8 8-8h143q8 0 8 8v48q0 8-8 8H104q-8 0-8-8zm352 168h32v128h-32V320zm-32-128v128h-31V192h31zM319 64v128h-31V64h31z";
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
  var _default = "SAP-icons-v4/horizontal-bullet-chart";
  _exports.default = _default;
});