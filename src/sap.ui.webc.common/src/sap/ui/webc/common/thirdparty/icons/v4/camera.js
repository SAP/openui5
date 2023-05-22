sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "camera";
  const pathData = "M0 158q0-13 9.5-21.5T32 128h64q4-14 11.5-30.5t17-31 19-24.5T160 32h192q9 0 18 9.5t17.5 24 16 31.5 12.5 31h64q9 0 16 4 6 3 11 9t5 17v290q0 12-9 22t-23 10H32q-13 0-22.5-10T0 448V158zm32 290h448V160h-87q-2-8-4.5-16t-6.5-16q-7-17-16-33.5T347 64H166q-11 14-19 30.5T132 128q-4 8-6.5 16t-5.5 16H32v288zm96-160q0-26 10-49.5t27.5-41T206 170t50-10 50 10 40.5 27.5 27.5 41 10 49.5q0 27-10 50t-27.5 40.5T306 406t-50 10-50-10-40.5-27.5T138 338t-10-50zm32 0q0 40 28 68t68 28 68-28 28-68-28-68-68-28-68 28-28 68zm272-96q16 0 16 16t-16 16-16-16 16-16z";
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
  var _default = "SAP-icons-v4/camera";
  _exports.default = _default;
});