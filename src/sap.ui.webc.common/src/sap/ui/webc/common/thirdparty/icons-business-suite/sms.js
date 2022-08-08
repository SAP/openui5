sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sms";
  const pathData = "M168 174V44q0-8 1-11 2-11 8-16.5T190 6q11-5 22-6h217q11 1 21 6 8 5 15 13t7 25v130q0 22-12 34t-31 17h-44l-43 80h-46v-80h-84q-23 0-33.5-15T168 174zM40 476V69q0-15 8.5-25.5T72 33h64v64H72v320h192v-81h32v140q0 15-8.5 25.5T264 512H72q-15 0-23.5-10.5T40 476zM200 44v130q0 11 6 16 4 2 6 2h116v91l48-91h53q1 0 5-2 6-5 6-16V44q0-5-6-9-2-1-3-1t-2-1H212q-4 0-6 1-6 1-6 10zm32 20h176v33H232V64zm0 64h176v33H232v-33zm-64 352q16 0 16-16 0-6-4.5-11t-11.5-5-11.5 5-4.5 11q0 16 16 16z";
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
  var _default = "sms";
  _exports.default = _default;
});