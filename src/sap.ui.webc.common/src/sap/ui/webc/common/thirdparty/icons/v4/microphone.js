sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "microphone";
  const pathData = "M160 256V96q0-42 27-69t69-27q41 0 69 27 27 28 27 69v160q0 42-27 69t-69 27q-41 0-68-28-28-27-28-68zm-80-64h48v64q0 30 10 49 10 25 28 41 17 18 41 28t49 10q27 0 50-10t40.5-27.5 27.5-41 10-49.5v-64h48q16 0 16 16t-16 16h-16v32q0 60-35.5 101.5T288 413v67h112q16 0 16 16t-16 16H112q-16 0-16-16t16-16h112v-67q-27-7-50.5-21.5t-41-35-27-46T96 256v-32H80q-16 0-16-16t16-16zm112-96v160q0 26 19 45t45 19q27 0 45.5-18.5T320 256V96q0-27-18-46-19-18-46-18-26 0-45 19t-19 45z";
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
  var _default = "SAP-icons-v4/microphone";
  _exports.default = _default;
});