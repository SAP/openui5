sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "firewall";
  const pathData = "M416 256H256v-64h160v64zm32 128v64H288v-64h160zM64 192h160v64H64v-64zm128-32V96h160v64H192zm64 224v64H96v-64h160zM0 96h160v64H0V96zm0 193h160v63H0v-63zm192 0h160v63H192v-63zM512 96v64H384V96h128zM384 289h128v63H384v-63zm64-97h64v64h-64v-64zM0 384h64v64H0v-64zm480 0h32v64h-32v-64zM0 192h32v64H0v-64z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "tnt-v2";
  const packageName = "@ui5/webcomponents-icons-tnt";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "tnt-v2/firewall";
  _exports.default = _default;
});