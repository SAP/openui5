sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "legal-section";
  const pathData = "M32 0h448q13 0 22.5 9t9.5 23v416q0 13-9.5 22.5T480 480H32q-14 0-23-9.5T0 448V32Q0 18 9 9t23-9zm0 448h448V32H32v416zm402-290H82V58h352v100zm-32-32V90H114v36h288zm32 164H82V190h352v100zm-32-32v-36H114v36h288zM82 320h352v100H82V320zm32 68h288v-36H114v36z";
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
  var _default = "legal-section";
  _exports.default = _default;
});