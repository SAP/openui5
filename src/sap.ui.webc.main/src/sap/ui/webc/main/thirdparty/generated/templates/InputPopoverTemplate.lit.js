sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`${ context.showSuggestions ? block1(context) : undefined }${ context.hasValueStateMessage ? block17(context) : undefined } `; };
	const block1 = (context) => { return litRender.html`<ui5-responsive-popover hide-arrow _disable-initial-focus placement-type="Bottom" horizontal-align="Left" style="${litRender.styleMap(context.styles.suggestionsPopover)}" @ui5-after-open="${ifDefined__default(context._afterOpenPopover)}" @ui5-after-close="${ifDefined__default(context._afterClosePopover)}" @ui5-scroll="${ifDefined__default(context._scroll)}">${ context._isPhone ? block2(context) : undefined }${ !context._isPhone ? block7(context) : undefined }<ui5-list separators="${ifDefined__default(context.suggestionSeparators)}">${ litRender.repeat(context.suggestionsTexts, (item, index) => item._id || index, (item, index) => block12(item)) }</ui5-list>${ context._isPhone ? block16(context) : undefined }</ui5-responsive-popover>`; };
	const block2 = (context) => { return litRender.html`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${ifDefined__default(context._headerTitleText)}</span><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${context._closeRespPopover}"></ui5-button></div><div class="row"><div class="input-root-phone"><input class="ui5-input-inner-phone" type="${ifDefined__default(context.inputType)}" .value="${ifDefined__default(context.value)}" inner-input placeholder="${ifDefined__default(context.placeholder)}" @input="${context._handleInput}" @change="${context._handleChange}" /></div></div>${ context.hasValueStateMessage ? block3(context) : undefined }</div>`; };
	const block3 = (context) => { return litRender.html`<div class="row ${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.suggestionPopoverHeader)}">${ context.shouldDisplayDefaultValueStateMessage ? block4(context) : block5(context) }</div>`; };
	const block4 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block5 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block6(item)) }`; };
	const block6 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block7 = (context) => { return litRender.html`${ context.hasValueStateMessage ? block8(context) : undefined }`; };
	const block8 = (context) => { return litRender.html`<div slot="header" class="ui5-responsive-popover-header ${litRender.classMap(context.classes.popoverValueState)}" style=${litRender.styleMap(context.styles.suggestionPopoverHeader)}>${ context.shouldDisplayDefaultValueStateMessage ? block9(context) : block10(context) }</div>`; };
	const block9 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block10 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block11(item)) }`; };
	const block11 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block12 = (item, index, context) => { return litRender.html`${ item.group ? block13(item) : block14(item) }`; };
	const block13 = (item, index, context) => { return litRender.html`<ui5-li-groupheader data-ui5-key="${ifDefined__default(item.key)}">${litRender.unsafeHTML(item.text)}</ui5-li-groupheader>`; };
	const block14 = (item, index, context) => { return litRender.html`<ui5-li-suggestion-item image="${ifDefined__default(item.image)}" icon="${ifDefined__default(item.icon)}" additionalText="${ifDefined__default(item.additionalText)}" type="${ifDefined__default(item.type)}" additional-text-state="${ifDefined__default(item.additionalText)}" @ui5-_item-press="${ifDefined__default(item.fnOnSuggestionItemPress)}" data-ui5-key="${ifDefined__default(item.key)}">${litRender.unsafeHTML(item.text)}${ item.description ? block15(item) : undefined }</ui5-li-suggestion-item>`; };
	const block15 = (item, index, context) => { return litRender.html`<span slot="richDescription">${litRender.unsafeHTML(item.description)}</span>`; };
	const block16 = (context) => { return litRender.html`<div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${context._closeRespPopover}">OK</ui5-button></div>`; };
	const block17 = (context) => { return litRender.html`<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore no-padding hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="Left"><div slot="header" class="${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.popoverHeader)}">${ context.shouldDisplayDefaultValueStateMessage ? block18(context) : block19(context) }</div></ui5-popover>`; };
	const block18 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block19 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block20(item)) }`; };
	const block20 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
