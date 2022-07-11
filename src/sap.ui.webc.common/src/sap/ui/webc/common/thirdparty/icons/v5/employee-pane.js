sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "employee-pane";
  const pathData = "M427 0q36 0 60.5 24.5T512 85v341q0 36-24.5 60.5T427 511H86q-36 0-60.5-24.5T1 426V85q0-36 24.5-60.5T86 0h341zm28 85q0-28-28-28H86q-28 0-28 28v341q0 28 28 28h341q28 0 28-28V85zM319 284q34 0 56.5 22.5T398 363v6q0 28-28 28H143q-13 0-21-7.5t-8-20.5v-6q0-34 23-56.5t57-22.5h125zm-63-171q24 0 40.5 17t16.5 40-16.5 40-40.5 17q-23 0-39.5-17T200 170t16.5-40 39.5-17z";
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
  var _default = "employee-pane";
  _exports.default = _default;
});