sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "table-column";
  const pathData = "M32 64q0-14 9.5-23T64 32h384q14 0 23 9t9 23v384q0 14-9 23t-23 9H64q-13 0-22.5-9T32 448V64zm416 248V203H344v109h104zm-280 0V203H64v109h104zM64 171h104V64H64v107zM344 64v107h104V64H344zm0 384h104V344H344v104zm-176 0V344H64v104h104z";
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
  var _default = "SAP-icons-v4/table-column";
  _exports.default = _default;
});