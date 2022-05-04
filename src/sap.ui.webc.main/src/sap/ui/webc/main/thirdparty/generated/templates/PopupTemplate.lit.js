sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<section style="${litRender.styleMap(context.styles.root)}" class="${litRender.classMap(context.classes.root)}" role="dialog" aria-modal="${litRender.ifDefined(context._ariaModal)}" aria-label="${litRender.ifDefined(context._ariaLabel)}" aria-labelledby="${litRender.ifDefined(context._ariaLabelledBy)}" @keydown=${context._onkeydown} @focusout=${context._onfocusout} @mouseup=${context._onmouseup} @mousedown=${context._onmousedown}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToLast}></span><div style="${litRender.styleMap(context.styles.content)}" class="${litRender.classMap(context.classes.content)}"  @scroll="${context._scroll}" part="content"><slot></slot></div><span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToFirst}></span></section> `;

	return block0;

});
