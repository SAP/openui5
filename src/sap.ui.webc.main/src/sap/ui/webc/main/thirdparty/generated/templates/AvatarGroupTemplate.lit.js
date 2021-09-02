sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-avatar-group-root"><div class="ui5-avatar-group-items" @keyup="${context._onkeyup}" @keydown="${context._onkeydown}" @focusin="${context._onfocusin}" tabindex="${litRender.ifDefined(context._groupTabIndex)}" @click="${context._onClick}" @ui5-click="${litRender.ifDefined(context._onUI5Click)}" aria-label="${litRender.ifDefined(context._ariaLabelText)}" role="${litRender.ifDefined(context._role)}" aria-haspopup="${litRender.ifDefined(context._containerAriaHasPopup)}"><slot></slot>${ context._customOverflowButton ? block1() : block2(context, tags, suffix) }</div></div>`;
	const block1 = (context, tags, suffix) => litRender.html`<slot name="overflowButton"></slot>`;
	const block2 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-button", tags, suffix)} ._buttonAccInfo="${litRender.ifDefined(context._overflowButtonAccInfo)}" aria-label="${litRender.ifDefined(context._overflowButtonAriaLabelText)}" ?hidden="${context._overflowBtnHidden}" ?non-interactive=${context._isGroup} class="${litRender.classMap(context.classes.overflowButton)}">${litRender.ifDefined(context._overflowButtonText)}</${litRender.scopeTag("ui5-button", tags, suffix)}>`;

	return block0;

});
