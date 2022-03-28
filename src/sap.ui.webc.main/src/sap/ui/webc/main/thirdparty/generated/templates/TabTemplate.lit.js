sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}" class="ui5-tab-root"><slot name="${litRender.ifDefined(context._defaultSlotName)}"></slot>${ litRender.repeat(context.tabs, (item, index) => item._id || index, (item, index) => block1(item)) }</div>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`<slot name="${litRender.ifDefined(item._effectiveSlotName)}"></slot>`;

	return block0;

});
