sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<span id="${litRender.ifDefined(context._id)}"></span>`;

	return block0;

});
