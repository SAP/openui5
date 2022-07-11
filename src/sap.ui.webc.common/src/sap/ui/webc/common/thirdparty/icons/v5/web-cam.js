sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "web-cam";
  const pathData = "M435 179q0 54-28 97t-74 64l46 138q3 14-3 23-7 11-20 11H151q-13 0-20-11-6-9-3-23l46-140q-44-21-70.5-64T77 179q0-37 14-69.5T129 53t57-38 70-14q38 0 70.5 14T383 53t38 56.5 14 69.5zM284 356q-8 2-14 2h-31.5l-15.5-2-36 107h133zm-28-49q27 0 50.5-10t40.5-27 27-40.5 10-50.5-10-50-27-40-40.5-27T256 52t-50 10-40.5 27-27.5 40-10 50 10 50.5 27.5 40.5 40.5 27 50 10zm0-204q32 0 54.5 22t22.5 54-22.5 54.5T256 256t-54.5-22.5T179 179t22.5-54 54.5-22z";
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
  var _default = "web-cam";
  _exports.default = _default;
});