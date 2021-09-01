sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<li role="option" aria-roledescription="${litRender.ifDefined(context.ariaDescription)}" aria-posinset="${litRender.ifDefined(context.posInSet)}" aria-setsize="${litRender.ifDefined(context.sizeOfSet)}" aria-selected="${litRender.ifDefined(context.pressed)}" class="ui5-button-root" aria-disabled="${litRender.ifDefined(context.disabled)}" data-sap-focus-ref  dir="${litRender.ifDefined(context.effectiveDir)}" @focusout=${context._onfocusout} @focusin=${context._onfocusin} @click=${context._onclick} @mousedown=${context._onmousedown} @mouseup=${context._onmouseup} @keydown=${context._onkeydown} @keyup=${context._onkeyup} @touchstart="${context._ontouchstart}" @touchend="${context._ontouchend}" tabindex=${litRender.ifDefined(context.tabIndexValue)} aria-label="${litRender.ifDefined(context.ariaLabelText)}" title="${litRender.ifDefined(context.accInfo.title)}">${ context.icon ? block1(context, tags, suffix) : undefined }<span id="${litRender.ifDefined(context._id)}-content" class="ui5-button-text"><bdi><slot></slot></bdi></span></li> `;
	const block1 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} class="ui5-button-icon" name="${litRender.ifDefined(context.icon)}" part="icon" ?show-tooltip=${context.showIconTooltip}></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;

	return block0;

});
