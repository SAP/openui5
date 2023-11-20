sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sms";
  const pathData = "M168 174V44c0-5 0-9 1-11 3-15 12-20 21-27 7-3 15-5 22-6h217c7 1 14 3 21 6 11 7 22 15 22 38v130c0 29-18 44-43 51h-44l-43 80h-46v-80h-84c-31 0-44-23-44-51zM40 476V69c0-20 12-36 32-36h64v64H72v320h192v-81h32v140c0 20-12 36-32 36H72c-20 0-32-16-32-36zM200 44v130c0 7 2 13 6 16 3 1 5 2 6 2h116v91l48-91h53c1 0 2-1 5-2 4-3 6-9 6-16V44c0-3-2-6-6-9-3-1-4-1-5-2H212c-3 0-5 0-6 1-4 1-6 4-6 10zm32 53V64h176v33H232zm0 64v-33h176v33H232zm-64 319c11 0 16-5 16-16 0-8-7-16-16-16s-16 8-16 16c0 11 5 16 16 16z";
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
  var _default = "business-suite-v1/sms";
  _exports.default = _default;
});