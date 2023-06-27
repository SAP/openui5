sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "draw-rectangle";
  const pathData = "M75.5 0v37h145V0h72v37h145V0h74v73h-37v147h37v72h-37v146h37v74h-74v-37h-145v37h-72v-37h-145v37h-74v-74h37V292h-37v-72h37V73h-37V0h74zm362 73h-362v365h362V73z";
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
  var _default = "SAP-icons-v4/draw-rectangle";
  _exports.default = _default;
});