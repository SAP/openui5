sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`${ context._isPhone ? block1(context) : block6(context) }`; };
	const block1 = (context) => { return litRender.html`<ui5-dialog ?with-padding=${context.withPadding} stretch _disable-initial-focus @ui5-before-open="${ifDefined__default(context._propagateDialogEvent)}" @ui5-after-open="${ifDefined__default(context._afterDialogOpen)}" @ui5-before-close="${ifDefined__default(context._propagateDialogEvent)}" @ui5-after-close="${ifDefined__default(context._afterDialogClose)}">${ !context._hideHeader ? block2(context) : undefined }<slot></slot><slot slot="footer" name="footer"></slot></ui5-dialog>`; };
	const block2 = (context) => { return litRender.html`${ context.header.length ? block3() : block4(context) }`; };
	const block3 = (context) => { return litRender.html`<slot slot="header" name="header"></slot>`; };
	const block4 = (context) => { return litRender.html`<header class="${litRender.classMap(context.classes.header)}">${ context.headerText ? block5(context) : undefined }<ui5-button icon="decline" design="Transparent" aria-label="${ifDefined__default(context._closeDialogAriaLabel)}" @click="${context.close}"></ui5-button></header>`; };
	const block5 = (context) => { return litRender.html`<ui5-title level="H2" class="ui5-popup-header-text ui5-responsive-popover-header-text">${ifDefined__default(context.headerText)}</ui5-title>`; };
	const block6 = (context) => { return litRender.html`<section style="${litRender.styleMap(context.styles.root)}" class="${litRender.classMap(context.classes.root)}" role="dialog" aria-modal="${ifDefined__default(context._ariaModal)}" aria-label="${ifDefined__default(context._ariaLabel)}" aria-labelledby="${ifDefined__default(context._ariaLabelledBy)}" dir="${ifDefined__default(context.effectiveDir)}" tabindex="-1" @keydown=${context._onkeydown} @focusout=${context._onfocusout}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToLast}></span><span class="ui5-popover-arrow" style="${litRender.styleMap(context.styles.arrow)}"></span>${ context._displayHeader ? block7(context) : undefined }<div style="${litRender.styleMap(context.styles.content)}" class="${litRender.classMap(context.classes.content)}"  @scroll="${context._scroll}"><slot></slot></div>${ context._displayFooter ? block10(context) : undefined }<span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToFirst}></span></section>`; };
	const block7 = (context) => { return litRender.html`<header class="ui5-popup-header-root" id="ui5-popup-header">${ context.header.length ? block8() : block9(context) }</header>`; };
	const block8 = (context) => { return litRender.html`<slot name="header"></slot>`; };
	const block9 = (context) => { return litRender.html`<h2 class="ui5-popup-header-text">${ifDefined__default(context.headerText)}</h2>`; };
	const block10 = (context) => { return litRender.html`${ context.footer.length ? block11() : undefined }`; };
	const block11 = (context) => { return litRender.html`<footer class="ui5-popup-footer-root"><slot name="footer"></slot></footer>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
