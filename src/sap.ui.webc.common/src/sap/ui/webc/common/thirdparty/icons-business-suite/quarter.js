sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "quarter";
  const pathData = "M16 512V32h64V0h32v32h32V0h32v32h160V0h32v32h32V0h32v32h64v480H16zM433 63h-33v33h33V63zm-65 33V63h-32v33h32zM144 64v32h32V64h-32zm-32 32V64H80v32h32zM48 480h416V160H48v320zm128-32V192h64v256h-64zm192 0V192h64v256h-64zm-96 0V192h64v256h-64zM80 192h64v256H80V192z";
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
  var _default = "quarter";
  _exports.default = _default;
});