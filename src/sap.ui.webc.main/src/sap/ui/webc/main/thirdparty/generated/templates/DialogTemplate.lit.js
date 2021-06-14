sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<section style="${litRender.styleMap(context.styles.root)}" class="${litRender.classMap(context.classes.root)}" role="dialog" aria-modal="${ifDefined__default(context._ariaModal)}" aria-label="${ifDefined__default(context._ariaLabel)}" aria-labelledby="${ifDefined__default(context._ariaLabelledBy)}" dir="${ifDefined__default(context.effectiveDir)}" tabindex="-1" @keydown=${context._onkeydown} @focusout=${context._onfocusout}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToLast}></span>${ context._displayHeader ? block1(context) : undefined }<div style="${litRender.styleMap(context.styles.content)}" class="${litRender.classMap(context.classes.content)}"  @scroll="${context._scroll}"><slot></slot></div>${ context.footer.length ? block4() : undefined }${ context.resizable ? block5(context) : undefined }<span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToFirst}></span></section> `; };
	const block1 = (context) => { return litRender.html`<header class="ui5-popup-header-root" id="ui5-popup-header" @mousedown="${context._onDragMouseDown}">${ context.header.length ? block2() : block3(context) }</header>`; };
	const block2 = (context) => { return litRender.html`<slot name="header"></slot>`; };
	const block3 = (context) => { return litRender.html`<h2 id="ui5-popup-header-text" class="ui5-popup-header-text">${ifDefined__default(context.headerText)}</h2>`; };
	const block4 = (context) => { return litRender.html`<footer class="ui5-popup-footer-root"><slot name="footer"></slot></footer>`; };
	const block5 = (context) => { return litRender.html`<ui5-icon name="resize-corner" dir="${ifDefined__default(context.effectiveDir)}" class="ui5-popup-resize-handle" @mousedown="${context._onResizeMouseDown}"></ui5-icon>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
