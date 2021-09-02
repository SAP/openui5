sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-tli-root" dir="${litRender.ifDefined(context.effectiveDir)}"><div class="${litRender.classMap(context.classes.indicator)}"><div class="ui5-tli-icon-outer">${ context.icon ? block1(context, tags, suffix) : block2() }</div></div><div class="ui5-tli-bubble" tabindex="${litRender.ifDefined(context._tabIndex)}" role="option" data-sap-focus-ref><div class="ui5-tli-title">${ context.name ? block3(context, tags, suffix) : undefined }<span>${litRender.ifDefined(context.titleText)}</span></div><div class="ui5-tli-subtitle">${litRender.ifDefined(context.subtitleText)}</div>${ context.textContent ? block6() : undefined }<span class="${litRender.classMap(context.classes.bubbleArrowPosition)}"></span></div></div>`;
	const block1 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} class="ui5-tli-icon" name="${litRender.ifDefined(context.icon)}"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block2 = (context, tags, suffix) => litRender.html`<div class="ui5-tli-dummy-icon-container"></div>`;
	const block3 = (context, tags, suffix) => litRender.html`${ context.nameClickable ? block4(context, tags, suffix) : block5(context) }`;
	const block4 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-link", tags, suffix)} @click="${context.onNamePress}" class="ui5-tli-title-name-clickable">${litRender.ifDefined(context.name)}&nbsp;</${litRender.scopeTag("ui5-link", tags, suffix)}>`;
	const block5 = (context, tags, suffix) => litRender.html`<span class="ui5-tli-title-name">${litRender.ifDefined(context.name)}&nbsp;</span>`;
	const block6 = (context, tags, suffix) => litRender.html`<div class="ui5-tli-desc"><slot></slot></div>`;

	return block0;

});
