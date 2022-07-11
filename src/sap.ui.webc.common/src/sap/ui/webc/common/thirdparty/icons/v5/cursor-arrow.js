sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "cursor-arrow";
  const pathData = "M320.5 275l-158-139v210l56-41q15-12 32-15zm74-4q9 7 9 19 0 5-1 7-3 16-20 19l-75 16 45 94q2 4 2 11 0 16-14 22l-38 19h-2q-6 2-8 2-17 0-23-14l-47-98-68 52q-6 5-16 5-8 0-12-2-7-4-11.5-10t-4.5-14V76q-1-1-1-3 2-14 14-20h2q3-2 9-2 11 0 18 6z";
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
  var _default = "cursor-arrow";
  _exports.default = _default;
});