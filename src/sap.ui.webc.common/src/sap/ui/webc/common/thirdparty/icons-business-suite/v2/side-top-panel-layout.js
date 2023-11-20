sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "side-top-panel-layout";
  const pathData = "M424 0c40 0 72 32 72 72v336c0 40-32 72-72 72H88c-40 0-72-32-72-72V72C16 32 48 0 88 0h336zM64 72v336c0 13 11 24 24 24h48V48H88c-13 0-24 11-24 24zm120-24v72h264V72c0-13-11-24-24-24H184zm240 384c13 0 24-11 24-24V168H184v264h240z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v2";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v2/side-top-panel-layout";
  _exports.default = _default;
});