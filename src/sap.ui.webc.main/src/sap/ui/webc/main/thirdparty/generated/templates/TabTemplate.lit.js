sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}" class="ui5-tab-root"><slot></slot></div>`;

	return block0;

});
