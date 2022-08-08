sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/lit-html/lit-html", "../FeaturesRegistry", "sap/ui/webc/common/thirdparty/lit-html/directives/repeat", "sap/ui/webc/common/thirdparty/lit-html/directives/class-map", "./directives/style-map", "sap/ui/webc/common/thirdparty/lit-html/directives/if-defined", "sap/ui/webc/common/thirdparty/lit-html/directives/unsafe-html"], function (_exports, _litHtml, _FeaturesRegistry, _repeat, _classMap, _styleMap, _ifDefined, _unsafeHtml) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "classMap", {
    enumerable: true,
    get: function () {
      return _classMap.classMap;
    }
  });
  _exports.html = _exports.default = void 0;
  Object.defineProperty(_exports, "ifDefined", {
    enumerable: true,
    get: function () {
      return _ifDefined.ifDefined;
    }
  });
  Object.defineProperty(_exports, "repeat", {
    enumerable: true,
    get: function () {
      return _repeat.repeat;
    }
  });
  _exports.scopeTag = void 0;
  Object.defineProperty(_exports, "styleMap", {
    enumerable: true,
    get: function () {
      return _styleMap.styleMap;
    }
  });
  _exports.svg = void 0;
  Object.defineProperty(_exports, "unsafeHTML", {
    enumerable: true,
    get: function () {
      return _unsafeHtml.unsafeHTML;
    }
  });

  const effectiveHtml = (...args) => {
    const LitStatic = (0, _FeaturesRegistry.getFeature)("LitStatic");
    const fn = LitStatic ? LitStatic.html : _litHtml.html;
    return fn(...args);
  };

  _exports.html = effectiveHtml;

  const effectiveSvg = (...args) => {
    const LitStatic = (0, _FeaturesRegistry.getFeature)("LitStatic");
    const fn = LitStatic ? LitStatic.svg : _litHtml.svg;
    return fn(...args);
  };

  _exports.svg = effectiveSvg;

  const litRender = (templateResult, domNode, styleStrOrHrefsArr, forStaticArea, {
    host
  } = {}) => {
    const OpenUI5Enablement = (0, _FeaturesRegistry.getFeature)("OpenUI5Enablement");

    if (OpenUI5Enablement && !forStaticArea) {
      templateResult = OpenUI5Enablement.wrapTemplateResultInBusyMarkup(effectiveHtml, host, templateResult);
    }

    if (typeof styleStrOrHrefsArr === "string") {
      templateResult = effectiveHtml`<style>${styleStrOrHrefsArr}</style>${templateResult}`;
    } else if (Array.isArray(styleStrOrHrefsArr) && styleStrOrHrefsArr.length) {
      templateResult = effectiveHtml`${styleStrOrHrefsArr.map(href => effectiveHtml`<link type="text/css" rel="stylesheet" href="${href}">`)}${templateResult}`;
    }

    (0, _litHtml.render)(templateResult, domNode, {
      host
    });
  };

  const scopeTag = (tag, tags, suffix) => {
    const LitStatic = (0, _FeaturesRegistry.getFeature)("LitStatic");

    if (LitStatic) {
      return LitStatic.unsafeStatic((tags || []).includes(tag) ? `${tag}-${suffix}` : tag);
    }
  };

  _exports.scopeTag = scopeTag;
  var _default = litRender;
  _exports.default = _default;
});