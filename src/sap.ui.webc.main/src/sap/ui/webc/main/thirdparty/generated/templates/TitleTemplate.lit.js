sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`${ context.h1 ? block1(context) : undefined }${ context.h2 ? block2(context) : undefined }${ context.h3 ? block3(context) : undefined }${ context.h4 ? block4(context) : undefined }${ context.h5 ? block5(context) : undefined }${ context.h6 ? block6(context) : undefined }`; };
	const block1 = (context) => { return litRender.html`<h1 class="ui5-title-root"><span id="${ifDefined__default(context._id)}-inner"><slot></slot></span></h1>`; };
	const block2 = (context) => { return litRender.html`<h2 class="ui5-title-root"><span id="${ifDefined__default(context._id)}-inner"><slot></slot></span></h2>`; };
	const block3 = (context) => { return litRender.html`<h3 class="ui5-title-root"><span id="${ifDefined__default(context._id)}-inner"><slot></slot></span></h3>`; };
	const block4 = (context) => { return litRender.html`<h4 class="ui5-title-root"><span id="${ifDefined__default(context._id)}-inner"><slot></slot></span></h4>`; };
	const block5 = (context) => { return litRender.html`<h5 class="ui5-title-root"><span id="${ifDefined__default(context._id)}-inner"><slot></slot></span></h5>`; };
	const block6 = (context) => { return litRender.html`<h6 class="ui5-title-root"><span id="${ifDefined__default(context._id)}-inner"><slot></slot></span></h6>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
