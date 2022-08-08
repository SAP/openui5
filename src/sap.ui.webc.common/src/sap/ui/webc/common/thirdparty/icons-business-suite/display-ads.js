sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "display-ads";
  const pathData = "M0 0h512v384H320v96h96v32H96v-32h95v-96H0V0zm32 352h448V32H32v320zm416-224H64V64h384v64zM105 242q-19 0-29-13-12-12-12-28 0-18 11.5-29.5T105 160q17 0 28 11 11 13 11 30 0 15-11 28-10 13-28 13zm215-50H176v-32h144v32zm128 128h-96V160h96v160zm-128-64H176v-32h144v32zm0 64H64v-32h256v32z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "display-ads";
  _exports.default = _default;
});