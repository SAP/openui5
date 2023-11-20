sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "heading1";
  const pathData = "M0 400V80q0-16 16-16h8q16 0 16 16v144h176V80q0-16 16-16h8q16 0 16 16v320q0 16-16 16h-8q-16 0-16-16V256H40v144q0 16-16 16h-8q-16 0-16-16zm352-133l64-43h32v224h64v32H352v-32h56V266l-56 38v-37z";
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
  var _default = "SAP-icons-v4/heading1";
  _exports.default = _default;
});