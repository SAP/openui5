sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-responsive-popover tokenizer-popover="true" style=${litRender.styleMap(context.styles.popover)} header-text=${ifDefined__default(context.morePopoverTitle)} ?content-only-on-desktop="${context.hasValueState}" hide-arrow placement-type="Bottom" horizontal-align="Left">${ !context.hasValueState ? block1(context) : undefined }<ui5-list class="ui5-tokenizer-list" mode="Delete" @ui5-item-delete=${ifDefined__default(context.itemDelete)}>${ litRender.repeat(context._tokens, (item, index) => item._id || index, (item, index) => block4(item)) }</ui5-list>${ context._isPhone ? block5(context) : undefined }</ui5-responsive-popover>`; };
	const block1 = (context) => { return litRender.html`<div slot="header" class="ui5-responsive-popover-header" style="${litRender.styleMap(context.styles.popoverHeader)}">${ context._isPhone ? block2(context) : undefined }<div class="${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.popoverValueStateMessage)}">${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block3(item)) }</div></div>`; };
	const block2 = (context) => { return litRender.html`<div class="row" style="${litRender.styleMap(context.styles.popoverHeaderTitle)}"><ui5-title level="H5" class="ui5-responsive-popover-header-text">Remove</ui5-title><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${context.closeMorePopover}"></ui5-button></div>`; };
	const block3 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block4 = (item, index, context) => { return litRender.html`<ui5-li .tokenRef=${ifDefined__default(item)}>${ifDefined__default(item.text)}</ui5-li>`; };
	const block5 = (context) => { return litRender.html`<div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${context.closeMorePopover}">OK</ui5-button></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
