sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "globe";
  const pathData = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm-26 179q0 11-7 18.5t-18 7.5h-41l51 51h92q11 0 18.5 7.5T333 282v76q28 0 44 12.5t24 29.5q28-28 44-65t16-79q0-65-35.5-116T333 66v36q0 11-7.5 18.5T307 128h-77v51zM55 219q-4 16-4 37 0 39 14 74t38 62 57 44.5 70 22.5v-53q-23-8-35-26t-15-36z";
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
  var _default = "globe";
  _exports.default = _default;
});