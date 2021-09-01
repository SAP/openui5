sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-product-switch-root" role="list" aria-label="${litRender.ifDefined(context._ariaLabelText)}" @focusin=${context._onfocusin} @keydown=${context._onkeydown}><slot></slot></div>`;

	return block0;

});
