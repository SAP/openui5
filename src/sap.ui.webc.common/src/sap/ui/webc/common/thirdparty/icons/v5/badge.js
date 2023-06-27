sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "badge";
  const pathData = "M412 96L256 52 99 96v160q0 43 19.5 77.5t45.5 60 52.5 41.5 39.5 23q13-7 39-23t52-41.5 45.5-60T412 256V96zm33-44q19 5 19 25v179q0 42-14 77t-35.5 63-46.5 49-47 35.5-37.5 21.5-17.5 8q-6 2-10 2t-10-2q-2-1-17.5-8T191 480.5 144 445t-46.5-49T62 333t-14-77V77q0-20 19-25L249 1q6-2 14 0zM204 256l-34-35q-3-3-3-8 0-11 11-13l46-7 21-45q3-7 11-7 9 0 12 7l21 45 46 7q11 2 11 13 0 4-4 8l-34 35 8 49 1 2q0 6-4.5 9.5T303 320q-2 0-3-1h-2l-42-23-41 23q-2 1-6 1-5 0-9.5-4t-3.5-11z";
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
  var _default = "SAP-icons-v5/badge";
  _exports.default = _default;
});