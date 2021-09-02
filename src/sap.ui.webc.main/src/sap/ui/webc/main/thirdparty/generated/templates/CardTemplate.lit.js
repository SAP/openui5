sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="${litRender.classMap(context.classes)}" dir="${litRender.ifDefined(context.effectiveDir)}" role="region" aria-labelledby="${litRender.ifDefined(context._id)}-desc">${ context._hasHeader ? block1() : undefined }<div role="group" aria-label="${litRender.ifDefined(context._ariaCardContentLabel)}"><slot></slot></div><span id="${litRender.ifDefined(context._id)}-desc" class="ui5-hidden-text">${litRender.ifDefined(context._ariaCardRoleDescription)}</span></div>`;
	const block1 = (context, tags, suffix) => litRender.html`<div class="ui5-card-header-root"><slot name="header"></slot></div>`;

	return block0;

});
