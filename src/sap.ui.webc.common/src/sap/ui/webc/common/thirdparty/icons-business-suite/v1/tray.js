sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "tray";
  const pathData = "M413 98H98c-5 0-8 3-9 8v1l-1 2-48 172c-1 3 1 5 2 6s3 3 7 3h413c4 0 6-2 7-3s3-3 2-6l-48-172-1-2v-1c-1-5-4-8-9-8zm0-32c20 0 37 15 41 34l49 174c4 25-15 48-41 48H49c-26 0-45-23-41-48l49-174c4-19 21-34 41-34h315zm90 202c6 6 9 14 9 22v128c0 10-3 17-9 23s-14 9-23 9H32c-9 0-17-3-23-9s-9-13-9-23V290c0-8 3-16 9-22s14-10 23-10h96c0 22 11 32 32 32h193c21 0 31-10 31-32h96c9 0 17 4 23 10zm-23 150V290h-71c-11 22-30 32-56 32H160c-26 0-45-10-57-32H32v128h448z";
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
  var _default = "business-suite-v1/tray";
  _exports.default = _default;
});