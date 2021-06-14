sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-badge-root" dir="${ifDefined__default(context.effectiveDir)}">${ context.hasIcon ? block1() : undefined }${ context.hasText ? block2() : undefined }<span class="ui5-hidden-text">${ifDefined__default(context.badgeDescription)}</span></div>`; };
	const block1 = (context) => { return litRender.html`<slot name="icon"></slot>`; };
	const block2 = (context) => { return litRender.html`<label class="ui5-badge-text"><bdi><slot></slot></bdi></label>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
