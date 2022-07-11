sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "collapse-all";
  const pathData = "M60 191q-8 8-18 8-11 0-18.5-7.5T16 173q0-10 8-18l77-78q7-7 18-7t18 7l78 78q7 7 7 18t-7.5 18.5T196 199q-10 0-18-8l-33-33v298q0 11-7.5 18.5T119 482t-18.5-7.5T93 456V158zm230-70q-11 0-18.5-7T264 96t7.5-18.5T290 70h180q11 0 18.5 7.5T496 96t-7.5 18-18.5 7H290z";
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
  var _default = "collapse-all";
  _exports.default = _default;
});