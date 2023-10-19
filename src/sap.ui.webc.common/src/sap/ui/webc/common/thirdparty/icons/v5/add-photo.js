sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "add-photo";
  const pathData = "M314 138q-11 0-18.5-7.5T288 112t7.5-18.5T314 86h60V26q0-11 7.5-18.5T400 0t18.5 7.5T426 26v60h60q11 0 18.5 7.5T512 112t-7.5 18.5T486 138h-60v60q0 11-7.5 18.5T400 224t-18.5-7.5T374 198v-60h-60zM90 429q11 0 18 7t7 18-7 18.5-18 7.5H58q-24 0-41-17T0 422V186q0-24 17-41t41-17h61l44-54q7-10 20-10h47q11 0 18.5 7.5T256 90t-7.5 18-18.5 7h-34l-40 49q-7 9-13 12t-11 3H58q-7 0-7 7v236q0 7 7 7h32zm22-205q16 0 16 16t-16 16-16-16 16-16zm144 0q27 0 50 10t40.5 27.5T374 302t10 50-10 50-27.5 40.5T306 470t-50 10-50-10-40.5-27.5T138 402t-10-50 10-50 27.5-40.5T206 234t50-10zm0 205q32 0 54.5-22.5T333 352t-22.5-54.5T256 275t-54.5 22.5T179 352t22.5 54.5T256 429zm230-141q11 0 18.5 7.5T512 314v108q0 24-17 41t-41 17h-28q-11 0-18.5-7.5T400 454t7.5-18 18.5-7h28q7 0 7-7V314q0-11 7-18.5t18-7.5z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ADD_PHOTO;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "SAP-icons-v5/add-photo";
  _exports.default = _default;
});