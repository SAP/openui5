sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-responsive-popover placement-type="Bottom" horizontal-align="Left" class="ui5-multi-combobox-all-items-responsive-popover" hide-arrow _disable-initial-focus @ui5-selection-change=${ifDefined__default(context._listSelectionChange)} @ui5-after-close=${ifDefined__default(context._toggle)} @ui5-after-open=${ifDefined__default(context._toggle)}>${ context._isPhone ? block1(context) : undefined }${ !context._isPhone ? block6(context) : undefined }<ui5-list separators="None" mode="MultiSelect" class="ui5-multi-combobox-all-items-list">${ litRender.repeat(context._filteredItems, (item, index) => item._id || index, (item, index) => block11(item, index, context)) }</ui5-list>${ context._isPhone ? block12(context) : undefined }</ui5-responsive-popover>${ context.hasValueStateMessage ? block13(context) : undefined } `; };
	const block1 = (context) => { return litRender.html`<div slot="header" class="ui5-responsive-popover-header" style="${litRender.styleMap(context.styles.popoverHeader)}"><div class="row"><span>${ifDefined__default(context._headerTitleText)}</span><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${context.togglePopover}"></ui5-button></div><div class="row"><div slot="header" class="input-root-phone" value-state="${ifDefined__default(context.valueState)}"><input .value="${ifDefined__default(context.value)}" inner-input placeholder="${ifDefined__default(context.placeholder)}" value-state="${ifDefined__default(context.valueState)}" @input="${context._inputLiveChange}" @change=${context._inputChange} aria-autocomplete="both" aria-labelledby="${ifDefined__default(context._id)}-hiddenText-nMore" aria-describedby="${ifDefined__default(context._id)}-valueStateDesc" /></div><ui5-toggle-button slot="header" class="ui5-multi-combobox-toggle-button" icon="multiselect-all" design="Transparent" ?pressed=${context._showAllItemsButtonPressed} ?disabled=${context.allItemsSelected} @click="${context.filterSelectedItems}"></ui5-toggle-button></div>${ context.hasValueStateMessage ? block2(context) : undefined }</div></div>`; };
	const block2 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.popoverValueStateMessage)}">${ context.shouldDisplayDefaultValueStateMessage ? block3(context) : block4(context) }</div>`; };
	const block3 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block4 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block5(item)) }`; };
	const block5 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block6 = (context) => { return litRender.html`${ context.hasValueStateMessage ? block7(context) : undefined }`; };
	const block7 = (context) => { return litRender.html`<div slot="header" class="ui5-responsive-popover-header ${litRender.classMap(context.classes.popoverValueState)}" style=${litRender.styleMap(context.styles.popoverValueStateMessage)}>${ context.shouldDisplayDefaultValueStateMessage ? block8(context) : block9(context) }</div>`; };
	const block8 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block9 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block10(item)) }`; };
	const block10 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block11 = (item, index, context) => { return litRender.html`<ui5-li type="${ifDefined__default(context._listItemsType)}" additional-text=${ifDefined__default(item.additionalText)} ?selected=${item.selected} data-ui5-token-id="${ifDefined__default(item._id)}" data-ui5-stable="${ifDefined__default(item.stableDomRef)}">${ifDefined__default(item.text)}</ui5-li>`; };
	const block12 = (context) => { return litRender.html`<div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${context.togglePopover}">${ifDefined__default(context._dialogOkButton)}</ui5-button></div>`; };
	const block13 = (context) => { return litRender.html`<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore no-padding hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="Left"><div slot="header" class="${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.popoverHeader)}">${ context.shouldDisplayDefaultValueStateMessage ? block14(context) : block15(context) }</div></ui5-popover>`; };
	const block14 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block15 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block16(item)) }`; };
	const block16 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
