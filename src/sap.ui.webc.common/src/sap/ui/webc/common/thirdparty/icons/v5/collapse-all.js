sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "collapse-all";
  const pathData = "M314 115q-11 0-18.5-7T288 90t7.5-18.5T314 64h173q11 0 18 7.5t7 18.5-7 18-18 7H314zm-186 36v271q0 11-7 18.5t-18 7.5-18.5-7.5T77 422V151l-33 33q-8 8-18 8-11 0-18.5-7.5T0 166q0-10 8-18l76-77q9-7 19-7 9 0 18 7l76 77q8 8 8 18 0 11-7.5 18.5T179 192q-10 0-18-8z";
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
  var _default = "SAP-icons-v5/collapse-all";
  _exports.default = _default;
});