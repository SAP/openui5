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
  const effectiveHtml = (strings, ...values) => {
    const litStatic = (0, _FeaturesRegistry.getFeature)("LitStatic");
    const fn = litStatic ? litStatic.html : _litHtml.html;
    return fn(strings, ...values);
  };
  _exports.html = effectiveHtml;
  const effectiveSvg = (strings, ...values) => {
    const litStatic = (0, _FeaturesRegistry.getFeature)("LitStatic");
    const fn = litStatic ? litStatic.svg : _litHtml.svg;
    return fn(strings, ...values);
  };
  _exports.svg = effectiveSvg;
  const litRender = (templateResult, container, styleStrOrHrefsArr, forStaticArea, options) => {
    const openUI5Enablement = (0, _FeaturesRegistry.getFeature)("OpenUI5Enablement");
    if (openUI5Enablement && !forStaticArea) {
      templateResult = openUI5Enablement.wrapTemplateResultInBusyMarkup(effectiveHtml, options.host, templateResult);
    }
    if (typeof styleStrOrHrefsArr === "string") {
      templateResult = effectiveHtml`<style>${styleStrOrHrefsArr}</style>${templateResult}`;
    } else if (Array.isArray(styleStrOrHrefsArr) && styleStrOrHrefsArr.length) {
      templateResult = effectiveHtml`${styleStrOrHrefsArr.map(href => effectiveHtml`<link type="text/css" rel="stylesheet" href="${href}">`)}${templateResult}`;
    }
    (0, _litHtml.render)(templateResult, container, options);
  };
  const scopeTag = (tag, tags, suffix) => {
    const litStatic = (0, _FeaturesRegistry.getFeature)("LitStatic");
    if (litStatic) {
      return litStatic.unsafeStatic((tags || []).includes(tag) ? `${tag}-${suffix}` : tag);
    }
  };

  // @ts-ignore style-map is a JS file
  _exports.scopeTag = scopeTag;
  var _default = litRender;
  _exports.default = _default;
});