sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`${ context._isPhone ? block1(context, tags, suffix) : block7(context) }`;
	const block1 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-dialog", tags, suffix)} ?with-padding=${context.withPadding} stretch _disable-initial-focus @ui5-before-open="${litRender.ifDefined(context._propagateDialogEvent)}" @ui5-after-open="${litRender.ifDefined(context._afterDialogOpen)}" @ui5-before-close="${litRender.ifDefined(context._propagateDialogEvent)}" @ui5-after-close="${litRender.ifDefined(context._afterDialogClose)}">${ !context._hideHeader ? block2(context, tags, suffix) : undefined }<slot></slot><slot slot="footer" name="footer"></slot></${litRender.scopeTag("ui5-dialog", tags, suffix)}>`;
	const block2 = (context, tags, suffix) => litRender.html`${ context.header.length ? block3() : block4(context, tags, suffix) }`;
	const block3 = (context, tags, suffix) => litRender.html`<slot slot="header" name="header"></slot>`;
	const block4 = (context, tags, suffix) => litRender.html`<header class="${litRender.classMap(context.classes.header)}">${ context.headerText ? block5(context, tags, suffix) : undefined }${ !context._hideCloseButton ? block6(context, tags, suffix) : undefined }</header>`;
	const block5 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-title", tags, suffix)} level="H2" class="ui5-popup-header-text ui5-responsive-popover-header-text">${litRender.ifDefined(context.headerText)}</${litRender.scopeTag("ui5-title", tags, suffix)}>`;
	const block6 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-button", tags, suffix)} icon="decline" design="Transparent" aria-label="${litRender.ifDefined(context._closeDialogAriaLabel)}" @click="${context.close}"></${litRender.scopeTag("ui5-button", tags, suffix)}>`;
	const block7 = (context, tags, suffix) => litRender.html`<section style="${litRender.styleMap(context.styles.root)}" class="${litRender.classMap(context.classes.root)}" role="dialog" aria-modal="${litRender.ifDefined(context._ariaModal)}" aria-label="${litRender.ifDefined(context._ariaLabel)}" aria-labelledby="${litRender.ifDefined(context._ariaLabelledBy)}" dir="${litRender.ifDefined(context.effectiveDir)}" @keydown=${context._onkeydown} @focusout=${context._onfocusout} @mouseup=${context._onmouseup} @mousedown=${context._onmousedown}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToLast}></span><span class="ui5-popover-arrow" style="${litRender.styleMap(context.styles.arrow)}"></span>${ context._displayHeader ? block8(context) : undefined }<div style="${litRender.styleMap(context.styles.content)}" class="${litRender.classMap(context.classes.content)}"  @scroll="${context._scroll}"><slot></slot></div>${ context._displayFooter ? block11(context) : undefined }<span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToFirst}></span></section>`;
	const block8 = (context, tags, suffix) => litRender.html`<header class="ui5-popup-header-root" id="ui5-popup-header">${ context.header.length ? block9() : block10(context) }</header>`;
	const block9 = (context, tags, suffix) => litRender.html`<slot name="header"></slot>`;
	const block10 = (context, tags, suffix) => litRender.html`<h2 class="ui5-popup-header-text">${litRender.ifDefined(context.headerText)}</h2>`;
	const block11 = (context, tags, suffix) => litRender.html`${ context.footer.length ? block12() : undefined }`;
	const block12 = (context, tags, suffix) => litRender.html`<footer class="ui5-popup-footer-root"><slot name="footer"></slot></footer>`;

	return block0;

});
