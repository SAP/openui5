sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "create-session";
  const pathData = "M0 448V64q0-13 9-22.5T32 32h384q13 0 22.5 9.5T448 64v224h-32V160H32v288h224v32H32q-14 0-23-9t-9-23zm294-64h83l26-79 26 79h83l-68 49 26 79-67-49-68 49 26-79z";
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
  var _default = "SAP-icons-v4/create-session";
  _exports.default = _default;
});