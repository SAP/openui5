sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "split-segmentation";
  const pathData = "M0 512l60-196 52 52q47-38 70.5-93T208 160V0h96v160q2 60 25.5 115t70.5 93l52-52 60 196-196-60 56-56q-49-42-82.5-100T256 172q0 66-33.5 124T140 396l56 56z";
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
  var _default = "split-segmentation";
  _exports.default = _default;
});