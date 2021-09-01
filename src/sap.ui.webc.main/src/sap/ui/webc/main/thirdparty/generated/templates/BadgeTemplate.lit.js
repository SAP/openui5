sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-badge-root" dir="${litRender.ifDefined(context.effectiveDir)}"><slot name="icon"></slot>${ context.hasText ? block1() : undefined }<span class="ui5-hidden-text">${litRender.ifDefined(context.badgeDescription)}</span></div>`;
	const block1 = (context, tags, suffix) => litRender.html`<label class="ui5-badge-text"><bdi><slot></slot></bdi></label>`;

	return block0;

});
