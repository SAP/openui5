sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "message-warning";
  const pathData = "M256.1 143.944q12.995 0 23.49 7.997t10.497 24.99l-8.997 83.967-1.999 36.986q-2 20.991-23.99 20.991-7.998 0-15.495-4.998t-7.497-15.993q-1.999-37.986-3.498-61.476t-3-36.486-2.498-17.993l-1-4.998q0-16.993 10.496-24.99t23.491-7.997zm0 205.92q13.994 0 22.991 8.996t8.996 22.99-8.996 22.992-22.991 8.996-22.991-8.996-8.997-22.991 8.997-22.991 22.991-8.997zm244.904 22.99q8.997 18.993 10.996 36.986v5.998q0 30.987-22.991 47.481t-49.98 16.494H73.17q-12.995 0-25.99-4.499t-23.49-12.495-16.994-20.492T.2 414.837q-1-10.995 2.999-20.99t8.996-20.993L197.123 37.985Q220.114-1 258.099-1q36.986 0 58.977 38.985zm-64.974 74.971q42.983 0 42.983-31.987 0-9.997-7.997-27.99l-179.93-333.87q-5.997-11.994-15.494-17.492T257.1 30.988t-17.993 5.498-14.995 17.493L42.184 387.849q-6.998 12.994-6.998 27.989 0 31.987 41.984 31.987h358.86z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_MESSAGE_WARNING;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/message-warning";
  _exports.default = _default;
});