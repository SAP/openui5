sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-responsive-popover hide-arrow content-only-on-desktop _disable-initial-focus placement-type="Bottom" horizontal-align="Left" @ui5-after-open=${ifDefined__default(context._afterOpenPopover)} @ui5-after-close=${ifDefined__default(context._afterClosePopover)}><ui5-busy-indicator ?active=${context.loading} size="Medium" class="ui5-combobox-busy"></ui5-busy-indicator><div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${ifDefined__default(context._headerTitleText)}</span><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${context._closeRespPopover}"></ui5-button></div><div class="row"><div class="input-root-phone" value-state="${ifDefined__default(context.valueState)}"><input class="ui5-input-inner-phone" .value="${ifDefined__default(context._tempValue)}" inner-input placeholder="${ifDefined__default(context.placeholder)}" value-state="${ifDefined__default(context.valueState)}" @input="${context._input}" @change="${context._inputChange}" @keydown="${context._keydown}" aria-autocomplete="both" /></div></div>${ context.hasValueStateText ? block1(context) : undefined }</div>${ !context._isPhone ? block5(context) : undefined }<ui5-list separators="None" @ui5-item-click=${ifDefined__default(context._selectItem)} @ui5-item-focused=${ifDefined__default(context._onItemFocus)} @mousedown=${context._itemMousedown} mode="SingleSelect">${ litRender.repeat(context._filteredItems, (item, index) => item._id || index, (item, index) => block10(item)) }</ui5-list><div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${context._closeRespPopover}">OK</ui5-button></div></ui5-responsive-popover>${ context.shouldOpenValueStateMessagePopover ? block11(context) : undefined }`; };
	const block1 = (context) => { return litRender.html`<div class="row ${litRender.classMap(context.classes.popoverValueState)}">${ context.shouldDisplayDefaultValueStateMessage ? block2(context) : block3(context) }</div>`; };
	const block2 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block3 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block4(item)) }`; };
	const block4 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block5 = (context) => { return litRender.html`${ context.hasValueStateText ? block6(context) : undefined }`; };
	const block6 = (context) => { return litRender.html`<div class="ui5-responsive-popover-header ${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.suggestionPopoverHeader)}">${ context.shouldDisplayDefaultValueStateMessage ? block7(context) : block8(context) }</div>`; };
	const block7 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block8 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block9(item)) }`; };
	const block9 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block10 = (item, index, context) => { return litRender.html`<ui5-li type="Active" additional-text=${ifDefined__default(item.additionalText)} ._tabIndex=${ifDefined__default(item.itemTabIndex)} .mappedItem=${ifDefined__default(item)} ?selected=${item.selected} ?focused=${item.focused}>${ifDefined__default(item.text)}</ui5-li>`; };
	const block11 = (context) => { return litRender.html`<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore no-padding hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom"><div slot="header" class="${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.popoverHeader)}">${ context.shouldDisplayDefaultValueStateMessage ? block12(context) : block13(context) }</div></ui5-popover>`; };
	const block12 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block13 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block14(item)) }`; };
	const block14 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
