sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "rhombus-milestone";
  const pathData = "M490 203q22 22 22 51l-.5 15.5L490 307 309 490q-24 22-53 22-27 0-51-22L22 307Q0 285 0 255t22-52L205 21q21-21 51-21t53 21zm-25 78q10-10 10-25 0-16-10-26L282 47q-10-10-26-10-15 0-25 10L48 230q-11 10-11 25.5T48 281l183 183q11 11 25 11 15 0 26-11z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "rhombus-milestone";
  _exports.default = _default;
});