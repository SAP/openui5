sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<button type="button" class="ui5-button-root" ?disabled="${context.disabled}" data-sap-focus-ref  aria-pressed="${litRender.ifDefined(context.pressed)}"  dir="${litRender.ifDefined(context.effectiveDir)}" @focusout=${context._onfocusout} @focusin=${context._onfocusin} @click=${context._onclick} @mousedown=${context._onmousedown} @mouseup=${context._onmouseup} @keydown=${context._onkeydown} @keyup=${context._onkeyup} @touchstart="${context._ontouchstart}" @touchend="${context._ontouchend}" tabindex=${litRender.ifDefined(context.tabIndexValue)} aria-expanded="${litRender.ifDefined(context.accInfo.ariaExpanded)}" aria-controls="${litRender.ifDefined(context.accInfo.ariaControls)}" aria-haspopup="${litRender.ifDefined(context.accInfo.ariaHaspopup)}" aria-label="${litRender.ifDefined(context.accessibleName)}" title="${litRender.ifDefined(context.accInfo.title)}" part="button">${ context.icon ? block1(context, tags, suffix) : undefined }<span id="${litRender.ifDefined(context._id)}-content" class="ui5-button-text"><bdi><slot></slot></bdi></span>${ context.hasButtonType ? block2(context) : undefined }</button> `;
	const block1 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} class="ui5-button-icon" name="${litRender.ifDefined(context.icon)}" part="icon" ?show-tooltip=${context.showIconTooltip}></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block2 = (context, tags, suffix) => litRender.html`<span class="ui5-hidden-text">${litRender.ifDefined(context.buttonTypeText)}</span>`;

	return block0;

});
