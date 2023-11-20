sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "feeder-arrow";
  const pathData = "M202 128q10 0 17 7l109 102q8 8 8 19t-8 19L219 377q-7 7-17 7-11 0-18.5-7.5T176 358q0-10 8-18l89-84-89-84q-8-8-8-18 0-11 7.5-18.5T202 128z";
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
  var _default = "SAP-icons-v5/feeder-arrow";
  _exports.default = _default;
});