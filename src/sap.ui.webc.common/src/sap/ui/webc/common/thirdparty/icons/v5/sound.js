sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "sound";
  const pathData = "M385 45q9 3 12 9t3 14v360q0 8-3.5 14.5T385 451q-1 0-2 1-2 0-3 1h-4q-1 1-2 1-5 0-9-2.5t-9-5.5l-117-95H138q-12 0-19-7.5t-7-18.5V171q0-11 7-18.5t19-7.5h101l117-95q5-3 9-5.5t9-2.5q1 1 3 1h3q1 1 3 1 1 1 2 1zm-36 85l-81 59-2 1q-9 7-16 7h-86v102h86q7 0 16 7 1 1 2 1l81 59V130z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v5/sound";
  _exports.default = _default;
});