sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}" data-ui5-stable="${litRender.ifDefined(context.stableDomRef)}" role="separator" class="${litRender.classMap(context.classes)}"></div>`;

	return block0;

});
