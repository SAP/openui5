sap.ui.define(['exports', '../_chunks/style-map', 'sap/ui/webc/common/thirdparty/lit-html/static', 'sap/ui/webc/common/thirdparty/lit-html/directives/repeat', 'sap/ui/webc/common/thirdparty/lit-html/directives/class-map', 'sap/ui/webc/common/thirdparty/lit-html/directives/if-defined', 'sap/ui/webc/common/thirdparty/lit-html/directives/unsafe-html'], function (exports, styleMap, _static, repeat, classMap, ifDefined, unsafeHtml) { 'use strict';

	const litRender = (templateResult, domNode, styleStrOrHrefsArr, { host } = {}) => {
		if (typeof styleStrOrHrefsArr === "string") {
			templateResult = _static.html`<style>${styleStrOrHrefsArr}</style>${templateResult}`;
		} else if (Array.isArray(styleStrOrHrefsArr) && styleStrOrHrefsArr.length) {
			templateResult = _static.html`${styleStrOrHrefsArr.map(href => _static.html`<link type="text/css" rel="stylesheet" href="${href}">`)}${templateResult}`;
		}
		styleMap.w(templateResult, domNode, { host });
	};
	const scopeTag = (tag, tags, suffix) => {
		const resultTag = suffix && (tags || []).includes(tag) ? `${tag}-${suffix}` : tag;
		return _static.unsafeStatic(resultTag);
	};

	exports.styleMap = styleMap.styleMap;
	exports.html = _static.html;
	exports.svg = _static.svg;
	exports.unsafeStatic = _static.unsafeStatic;
	exports.repeat = repeat.repeat;
	exports.classMap = classMap.classMap;
	exports.ifDefined = ifDefined.ifDefined;
	exports.unsafeHTML = unsafeHtml.unsafeHTML;
	exports.default = litRender;
	exports.scopeTag = scopeTag;

	Object.defineProperty(exports, '__esModule', { value: true });

});
