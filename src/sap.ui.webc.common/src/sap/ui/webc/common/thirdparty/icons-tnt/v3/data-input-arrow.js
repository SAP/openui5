sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "data-input-arrow";
  const pathData = "M442 253L264 127v75H51v103h213v74zm60-21q10 6 10 21 0 14-10 21L257 447q-8 5-15 5h-3q-11 0-18.5-7.5T213 426v-70H25q-10 0-17.5-7.5T0 330V176q0-10 7.5-17.5T25 151h188V80q0-11 7.5-18.5T239 54q1 0 1.5.5t1.5.5q9 0 15 5z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "tnt-v3";
  const packageName = "@ui5/webcomponents-icons-tnt";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "tnt-v3/data-input-arrow";
  _exports.default = _default;
});