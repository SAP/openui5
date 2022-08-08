sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "badge";
  const pathData = "M409 96L256 52 102 96v160q0 43 19 77.5t44.5 60T217 435t39 23q13-7 38.5-23t51-41.5 44.5-60 19-77.5V96zm33-44q19 5 19 25v179q0 42-14 77t-35 63-45.5 49-46.5 35.5-37 21.5-17 8q-6 2-10 2t-10-2q-2-1-17-8t-37-21.5-46.5-35.5-45.5-49-35-63-14-77V77q0-20 19-25L249 1q6-2 14 0zM231 174q2-9 9-14.5t16-5.5 16 5.5 9 14.5l9 47 48 10q9 2 14.5 9t5.5 16-5.5 16-14.5 9l-48 10-9 47q-2 9-9 14.5t-16 5.5-16-5.5-9-14.5l-10-47-47-10q-9-2-15-9t-6-16 6-16 15-9l47-10z";
  _exports.pathData = pathData;
  const ltr = false;
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
  var _default = "badge";
  _exports.default = _default;
});