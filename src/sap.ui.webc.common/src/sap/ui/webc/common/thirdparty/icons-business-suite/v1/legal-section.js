sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "legal-section";
  const pathData = "M32 0h448c17 0 32 13 32 32v416c0 17-15 32-32 32H32c-19 0-32-15-32-32V32C0 13 13 0 32 0zm0 32v416h448V32H32zm402 26v100H82V58h352zm-320 68h288V90H114v36zm320 64v100H82V190h352zm-320 68h288v-36H114v36zM82 420V320h352v100H82zm32-68v36h288v-36H114z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v1";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v1/legal-section";
  _exports.default = _default;
});