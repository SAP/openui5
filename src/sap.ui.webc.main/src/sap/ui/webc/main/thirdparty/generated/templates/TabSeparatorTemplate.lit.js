sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<li id="${litRender.ifDefined(context._id)}" role="separator" style="list-style-type: none;"></li>`;

	return block0;

});
