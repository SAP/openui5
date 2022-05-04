sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="${litRender.classMap(context.classes)}" role="region" aria-label="${litRender.ifDefined(context._getAriaLabel)}">${ context._hasHeader ? block1() : undefined }<div role="group" aria-label="${litRender.ifDefined(context._ariaCardContentLabel)}"><slot></slot></div></div>`;
	const block1 = (context, tags, suffix) => litRender.html`<div class="ui5-card-header-root"><slot name="header"></slot></div>`;

	return block0;

});
