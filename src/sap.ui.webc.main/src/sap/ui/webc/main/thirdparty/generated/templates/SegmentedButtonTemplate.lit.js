sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<ul @click="${context._onclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @focusin="${context._onfocusin}" class="ui5-segmented-button-root" role="listbox" aria-multiselectable="true" aria-describedby="${litRender.ifDefined(context._id)}-invisibleText" aria-roledescription=${litRender.ifDefined(context.ariaDescription)} aria-label=${litRender.ifDefined(context.accessibleName)}><slot></slot><span id="${litRender.ifDefined(context._id)}-invisibleText" class="ui5-hidden-text">${litRender.ifDefined(context.ariaDescribedBy)}</span></ul>`;

	return block0;

});
