sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-list-root" @focusin="${context._onfocusin}" @keydown="${context._onkeydown}"><div class="ui5-list-scroll-container"><!-- header -->${ context.header.length ? block1() : undefined }${ context.shouldRenderH1 ? block2(context) : undefined }${ context.hasData ? block3(context) : undefined }<ul id="${ifDefined__default(context._id)}-listUl" class="ui5-list-ul" role="${ifDefined__default(context.accRole)}" aria-label="${ifDefined__default(context.ariaLabelТxt)}" aria-labelledby="${ifDefined__default(context.ariaLabelledBy)}" aria-multiselectable="${ifDefined__default(context.isMultiSelect)}"><slot></slot>${ context.showNoDataText ? block4(context) : undefined }</ul>${ context.growsWithButton ? block5(context) : undefined }${ context.footerText ? block6(context) : undefined }${ context.hasData ? block7(context) : undefined }<span tabindex="-1" aria-hidden="true" class="ui5-list-end-marker"></span></div>${ context.busy ? block8(context) : undefined }</div>`; };
	const block1 = (context) => { return litRender.html`<slot name="header" />`; };
	const block2 = (context) => { return litRender.html`<header id="${ifDefined__default(context.headerID)}" class="ui5-list-header">${ifDefined__default(context.headerText)}</header>`; };
	const block3 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}-before" tabindex="0" class="ui5-list-focusarea"></div>`; };
	const block4 = (context) => { return litRender.html`<li id="${ifDefined__default(context._id)}-nodata" class="ui5-list-nodata" tabindex="${ifDefined__default(context.noDataTabIndex)}" style="list-style-type: none;"><div id="${ifDefined__default(context._id)}-nodata-text" class="ui5-list-nodata-text">${ifDefined__default(context.noDataText)}</div></li>`; };
	const block5 = (context) => { return litRender.html`<div growing-button><div tabindex="0" role="button" aria-labelledby="${ifDefined__default(context._id)}-growingButton-text" ?active="${context._loadMoreActive}" @click="${context._onLoadMoreClick}" @keydown="${context._onLoadMoreKeydown}" @keyup="${context._onLoadMoreKeyup}" @mousedown="${context._onLoadMoreMousedown}" @mouseup="${context._onLoadMoreMouseup}" growing-button-inner><span id="${ifDefined__default(context._id)}-growingButton-text" growing-button-text>${ifDefined__default(context._growingButtonText)}</span></div></div>`; };
	const block6 = (context) => { return litRender.html`<footer id="${ifDefined__default(context._id)}-footer" class="ui5-list-footer">${ifDefined__default(context.footerText)}</footer>`; };
	const block7 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}-after" tabindex="0" class="ui5-list-focusarea"></div>`; };
	const block8 = (context) => { return litRender.html`<div class="ui5-list-busy-row"><ui5-busy-indicator active size="Medium" class="ui5-list-busy-ind" style="${litRender.styleMap(context.styles.busyInd)}"></ui5-busy-indicator></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
