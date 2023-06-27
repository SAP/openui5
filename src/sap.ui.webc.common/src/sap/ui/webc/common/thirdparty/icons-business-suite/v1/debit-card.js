sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "debit-card";
  const pathData = "M45.5 128h422c24 0 43 20 43 43v266c0 25-19 43-43 43h-422c-24 0-43-18-43-43V171c0-23 19-43 43-43zm422 288V192c0-11-8-21-21-21h-380c-12 0-21 10-21 21v224c0 13 9 21 21 21h380c14 0 21-7 21-21zm-395-73h367c5 0 7 2 7 6v35c0 5-2 7-7 7h-367c-5 0-7-2-7-7v-35c0-4 2-6 7-6z";
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
  var _default = "business-suite-v1/debit-card";
  _exports.default = _default;
});