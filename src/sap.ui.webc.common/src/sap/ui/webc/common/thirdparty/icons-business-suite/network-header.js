sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "network-header";
  const pathData = "M35.5 254h171v-35h-151V-3h401v222h-151v35h171v226h-441V254zm51-65h339V29h-339v160zm307-96h-276V61h276v32zm0 64h-276v-32h276v32zm-155 62v35h35v-35h-35zm-172 230h379V286h-379v163zm347-32h-315V317h315v100z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "network-header";
  _exports.default = _default;
});