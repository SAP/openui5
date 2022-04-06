sap.ui.define(['exports', '../_chunks/style-map', '../FeaturesRegistry', 'sap/ui/webc/common/thirdparty/lit-html/directives/repeat', 'sap/ui/webc/common/thirdparty/lit-html/directives/class-map', 'sap/ui/webc/common/thirdparty/lit-html/directives/if-defined', 'sap/ui/webc/common/thirdparty/lit-html/directives/unsafe-html'], function (exports, styleMap, FeaturesRegistry, repeat, classMap, ifDefined, unsafeHtml) { 'use strict';

	const effectiveHtml = (...args) => {
		const LitStatic = FeaturesRegistry.getFeature("LitStatic");
		const fn = LitStatic ? LitStatic.html : styleMap.p;
		return fn(...args);
	};
	const effectiveSvg = (...args) => {
		const LitStatic = FeaturesRegistry.getFeature("LitStatic");
		const fn = LitStatic ? LitStatic.svg : styleMap.y;
		return fn(...args);
	};
	const litRender = (templateResult, domNode, styleStrOrHrefsArr, forStaticArea, { host } = {}) => {
		const OpenUI5Enablement = FeaturesRegistry.getFeature("OpenUI5Enablement");
		if (OpenUI5Enablement && !forStaticArea) {
			templateResult = OpenUI5Enablement.wrapTemplateResultInBusyMarkup(effectiveHtml, host, templateResult);
		}
		if (typeof styleStrOrHrefsArr === "string") {
			templateResult = effectiveHtml`<style>${styleStrOrHrefsArr}</style>${templateResult}`;
		} else if (Array.isArray(styleStrOrHrefsArr) && styleStrOrHrefsArr.length) {
			templateResult = effectiveHtml`${styleStrOrHrefsArr.map(href => effectiveHtml`<link type="text/css" rel="stylesheet" href="${href}">`)}${templateResult}`;
		}
		styleMap.w(templateResult, domNode, { host });
	};
	const scopeTag = (tag, tags, suffix) => {
		const LitStatic = FeaturesRegistry.getFeature("LitStatic");
		if (LitStatic) {
			return LitStatic.unsafeStatic((tags || []).includes(tag) ? `${tag}-${suffix}` : tag);
		}
	};

	exports.styleMap = styleMap.styleMap;
	exports.repeat = repeat.repeat;
	exports.classMap = classMap.classMap;
	exports.ifDefined = ifDefined.ifDefined;
	exports.unsafeHTML = unsafeHtml.unsafeHTML;
	exports.default = litRender;
	exports.html = effectiveHtml;
	exports.scopeTag = scopeTag;
	exports.svg = effectiveSvg;

	Object.defineProperty(exports, '__esModule', { value: true });

});
