sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/lit-html/static", "./CustomElementsScopeUtils", "./FeaturesRegistry"], function (_exports, _static, _CustomElementsScopeUtils, _FeaturesRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "getCustomElementsScopingRules", {
    enumerable: true,
    get: function () {
      return _CustomElementsScopeUtils.getCustomElementsScopingRules;
    }
  });
  Object.defineProperty(_exports, "getCustomElementsScopingSuffix", {
    enumerable: true,
    get: function () {
      return _CustomElementsScopeUtils.getCustomElementsScopingSuffix;
    }
  });
  Object.defineProperty(_exports, "getEffectiveScopingSuffixForTag", {
    enumerable: true,
    get: function () {
      return _CustomElementsScopeUtils.getEffectiveScopingSuffixForTag;
    }
  });
  Object.defineProperty(_exports, "setCustomElementsScopingRules", {
    enumerable: true,
    get: function () {
      return _CustomElementsScopeUtils.setCustomElementsScopingRules;
    }
  });
  Object.defineProperty(_exports, "setCustomElementsScopingSuffix", {
    enumerable: true,
    get: function () {
      return _CustomElementsScopeUtils.setCustomElementsScopingSuffix;
    }
  });
  Object.defineProperty(_exports, "shouldScopeCustomElement", {
    enumerable: true,
    get: function () {
      return _CustomElementsScopeUtils.shouldScopeCustomElement;
    }
  });
  (0, _FeaturesRegistry.registerFeature)("LitStatic", {
    html: _static.html,
    svg: _static.svg,
    unsafeStatic: _static.unsafeStatic
  });
});