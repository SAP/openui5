sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "alphabetical-order";
  const pathData = "M1 406l73-300h74l73 300h-55l-17-80H73l-17 80H1zm80-117h59l-29-128zm239 117v-37l137-153H320v-36h192v36L375 369h137v37H320zm0-160v32h-96v-32h96z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "alphabetical-order";
  _exports.default = _default;
});