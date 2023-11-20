sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "light-mode";
  const pathData = "M240 0h32v96h-32V0zM55 32l73 73-23 23-73-73zm352 96l-23-23 73-73 23 23zM256 384q-27 0-50-10t-40.5-27.5T138 306t-10-50 10-50 27.5-40.5T206 138t50-10 50 10 40.5 27.5T374 206t10 50-10 50-27.5 40.5T306 374t-50 10zm0-32q40 0 68-28t28-68-28-68-68-28-68 28-28 68 28 68 68 28zm160-80v-32h96v32h-96zm-320 0H0v-32h96v32zm32 135l-73 73-23-23 73-73zm256 0l23-23 73 73-23 23zm-144 9h32v96h-32v-96z";
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
  var _default = "SAP-icons-v4/light-mode";
  _exports.default = _default;
});