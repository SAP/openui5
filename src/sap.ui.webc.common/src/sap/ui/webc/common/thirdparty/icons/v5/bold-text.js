sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "bold-text";
  const pathData = "M368 243q29 17 46.5 45t17.5 64q0 26-10 49.5t-27.5 41T354 470t-50 10H112q-14 0-23-9t-9-23V64q0-14 9-23t23-9h160q27 0 50 10t40.5 27.5 27.5 41 10 49.5q0 48-32 83zm-32-83q0-26-18.5-45T272 96H144v128h128q27 0 45.5-19t18.5-45zm-32 256q27 0 45.5-19t18.5-45-18.5-45-45.5-19H144v128h160z";
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
  var _default = "bold-text";
  _exports.default = _default;
});