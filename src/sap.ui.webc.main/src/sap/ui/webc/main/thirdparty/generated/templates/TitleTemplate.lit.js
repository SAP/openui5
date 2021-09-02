sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`${ context.h1 ? block1(context) : undefined }${ context.h2 ? block2(context) : undefined }${ context.h3 ? block3(context) : undefined }${ context.h4 ? block4(context) : undefined }${ context.h5 ? block5(context) : undefined }${ context.h6 ? block6(context) : undefined }`;
	const block1 = (context, tags, suffix) => litRender.html`<h1 class="ui5-title-root"><span id="${litRender.ifDefined(context._id)}-inner"><slot></slot></span></h1>`;
	const block2 = (context, tags, suffix) => litRender.html`<h2 class="ui5-title-root"><span id="${litRender.ifDefined(context._id)}-inner"><slot></slot></span></h2>`;
	const block3 = (context, tags, suffix) => litRender.html`<h3 class="ui5-title-root"><span id="${litRender.ifDefined(context._id)}-inner"><slot></slot></span></h3>`;
	const block4 = (context, tags, suffix) => litRender.html`<h4 class="ui5-title-root"><span id="${litRender.ifDefined(context._id)}-inner"><slot></slot></span></h4>`;
	const block5 = (context, tags, suffix) => litRender.html`<h5 class="ui5-title-root"><span id="${litRender.ifDefined(context._id)}-inner"><slot></slot></span></h5>`;
	const block6 = (context, tags, suffix) => litRender.html`<h6 class="ui5-title-root"><span id="${litRender.ifDefined(context._id)}-inner"><slot></slot></span></h6>`;

	return block0;

});
