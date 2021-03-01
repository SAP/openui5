sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/lit-html/lit-html', './scopeHTML', 'sap/ui/webc/common/thirdparty/lit-html/directives/repeat', 'sap/ui/webc/common/thirdparty/lit-html/directives/class-map', 'sap/ui/webc/common/thirdparty/lit-html/directives/style-map', 'sap/ui/webc/common/thirdparty/lit-html/directives/unsafe-html'], function (exports, litHtml, scopeHTML, repeat, classMap, styleMap, unsafeHtml) { 'use strict';

	let tags;
	let	suffix;
	const setTags = t => {
		tags = t;
	};
	const setSuffix = s => {
		suffix = s;
	};
	const litRender = (templateResult, domNode, styles, { eventContext } = {}) => {
		if (styles) {
			templateResult = litHtml.html`<style>${styles}</style>${templateResult}`;
		}
		litHtml.render(templateResult, domNode, { eventContext });
	};
	const scopedHtml = (strings, ...values) => litHtml.html(scopeHTML(strings, tags, suffix), ...values);
	const scopedSvg = (strings, ...values) => litHtml.svg(scopeHTML(strings, tags, suffix), ...values);

	exports.repeat = repeat.repeat;
	exports.classMap = classMap.classMap;
	exports.styleMap = styleMap.styleMap;
	exports.unsafeHTML = unsafeHtml.unsafeHTML;
	exports.default = litRender;
	exports.html = scopedHtml;
	exports.setSuffix = setSuffix;
	exports.setTags = setTags;
	exports.svg = scopedSvg;

	Object.defineProperty(exports, '__esModule', { value: true });

});
