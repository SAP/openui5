sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "message-popup";
  const pathData = "M0 352V64q0-26 19-45T64 0h384q27 0 45.5 19T512 64v288q0 26-18.5 45T448 416h-32v75q0 10-6.5 15.5T395 512t-12-4l-79-92H64q-26 0-45-19T0 352zm64 32h256l64 80v-80h64q14 0 23-9t9-23V64q0-13-9-22.5T448 32H64q-13 0-22.5 9.5T32 64v288q0 14 9.5 23t22.5 9zm161-272q0-16 10-24t21-8q12 0 21.5 8t9.5 24l-15 113q-2 11-5.5 14t-10.5 3q-6 0-10-2.5t-6-14.5zm31 160q15 0 23.5 9.5T288 303q0 16-10 24t-21 8q-12 0-22-8t-10-24q0-12 8.5-21.5T256 272z";
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
  var _default = "SAP-icons-v4/message-popup";
  _exports.default = _default;
});