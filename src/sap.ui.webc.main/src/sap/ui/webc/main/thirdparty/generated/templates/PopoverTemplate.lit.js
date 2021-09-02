sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<section style="${litRender.styleMap(context.styles.root)}" class="${litRender.classMap(context.classes.root)}" role="dialog" aria-modal="${litRender.ifDefined(context._ariaModal)}" aria-label="${litRender.ifDefined(context._ariaLabel)}" aria-labelledby="${litRender.ifDefined(context._ariaLabelledBy)}" dir="${litRender.ifDefined(context.effectiveDir)}" @keydown=${context._onkeydown} @focusout=${context._onfocusout} @mouseup=${context._onmouseup} @mousedown=${context._onmousedown}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToLast}></span><span class="ui5-popover-arrow" style="${litRender.styleMap(context.styles.arrow)}"></span>${ context._displayHeader ? block1(context) : undefined }<div style="${litRender.styleMap(context.styles.content)}" class="${litRender.classMap(context.classes.content)}"  @scroll="${context._scroll}"><slot></slot></div>${ context._displayFooter ? block4(context) : undefined }<span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToFirst}></span></section> `;
	const block1 = (context, tags, suffix) => litRender.html`<header class="ui5-popup-header-root" id="ui5-popup-header">${ context.header.length ? block2() : block3(context) }</header>`;
	const block2 = (context, tags, suffix) => litRender.html`<slot name="header"></slot>`;
	const block3 = (context, tags, suffix) => litRender.html`<h2 class="ui5-popup-header-text">${litRender.ifDefined(context.headerText)}</h2>`;
	const block4 = (context, tags, suffix) => litRender.html`${ context.footer.length ? block5() : undefined }`;
	const block5 = (context, tags, suffix) => litRender.html`<footer class="ui5-popup-footer-root"><slot name="footer"></slot></footer>`;

	return block0;

});
