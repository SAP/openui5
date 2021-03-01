sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`${ context.options ? block1(context) : undefined }${ context.shouldOpenValueStateMessagePopover ? block13(context) : undefined }`; };
	const block1 = (context) => { return litRender.html`<ui5-responsive-popover hide-arrow _disable-initial-focus content-only-on-desktop placement-type="Bottom" horizontal-align="Left" @ui5-after-open="${ifDefined__default(context._afterOpen)}" @ui5-before-open="${ifDefined__default(context._beforeOpen)}" @ui5-after-close="${ifDefined__default(context._afterClose)}" @keydown="${context._onkeydown}"><div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${ifDefined__default(context._headerTitleText)}</span><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${context._toggleRespPopover}"></ui5-button></div>${ context._isPhone ? block2(context) : undefined }</div>${ !context._isPhone ? block7(context) : undefined }<ui5-list mode="SingleSelectAuto" separators="None" @mousedown="${context._itemMousedown}" @ui5-item-press="${ifDefined__default(context._handleItemPress)}">${ litRender.repeat(context._syncedOptions, (item, index) => item._id || index, (item, index) => block12(item)) }</ui5-list></ui5-responsive-popover>`; };
	const block2 = (context) => { return litRender.html`${ context.hasValueStateText ? block3(context) : undefined }`; };
	const block3 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.popoverValueState)} row ui5-select-value-state-dialog-header">${ context.shouldDisplayDefaultValueStateMessage ? block4(context) : block5(context) }</div>`; };
	const block4 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block5 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block6(item)) }`; };
	const block6 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block7 = (context) => { return litRender.html`${ context.hasValueStateText ? block8(context) : undefined }`; };
	const block8 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.popoverValueState)} ui5-select-value-state-popover-padding" style="${litRender.styleMap(context.styles.responsivePopoverHeader)}">${ context.shouldDisplayDefaultValueStateMessage ? block9(context) : block10(context) }</div>`; };
	const block9 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const block10 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block11(item)) }`; };
	const block11 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block12 = (item, index, context) => { return litRender.html`<ui5-li id="${ifDefined__default(item.id)}-li" icon="${ifDefined__default(item.icon)}" ?selected="${item.selected}" ?focused="${item._focused}" ?disabled="${item.disabled}" ?aria-selected="${item.selected}" data-ui5-stable="${ifDefined__default(item.stableDomRef)}">${ifDefined__default(item.textContent)}</ui5-li>`; };
	const block13 = (context) => { return litRender.html`<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore no-padding hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom"><div slot="header" class="ui5-responsive-popover-header ${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.popoverHeader)}">${ context.shouldDisplayDefaultValueStateMessage ? block14(context) : block15(context) }</div></ui5-popover>`; };
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
