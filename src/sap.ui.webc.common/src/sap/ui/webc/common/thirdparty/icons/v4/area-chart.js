sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "area-chart";
  const pathData = "M237 315l110 37 149-65v128H91v-72zM91 269l146-129 110 19L496 0v110L347 252l-110-37-146 65v-11zM50 31v416h446v33H17V31h33zm41 286v-11l146-64 110 37 149-139v122l-149 64-110-37z";
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
  var _default = "SAP-icons-v4/area-chart";
  _exports.default = _default;
});