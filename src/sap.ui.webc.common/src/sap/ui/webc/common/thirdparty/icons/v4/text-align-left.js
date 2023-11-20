sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "text-align-left";
  const pathData = "M64 256h368q16 0 16 16t-16 16H64v-32zm0-192h368q16 0 16 16t-16 16H64V64zm368 384q16 0 16 16t-16 16H64v-32h368zM64 384v-32h176q16 0 16 16t-16 16H64zm0-224h176q16 0 16 16t-16 16H64v-32z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "SAP-icons-v4/text-align-left";
  _exports.default = _default;
});