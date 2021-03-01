sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.root)}" dir="${ifDefined__default(context.effectiveDir)}">${ context.tabsAtTheBottom ? block1(context) : undefined }<div class="${litRender.classMap(context.classes.header)}" id="${ifDefined__default(context._id)}-header"><div class="${litRender.classMap(context.classes.headerInnerContainer)}"><div class="${litRender.classMap(context.classes.headerBackArrow)}"><ui5-button @click="${context._onHeaderBackArrowClick}" icon="slim-arrow-left" design="Transparent" tabindex="-1" title="${ifDefined__default(context.previousIconACCName)}"></ui5-button></div><!-- tab items --><div class="${litRender.classMap(context.classes.headerScrollContainer)}" id="${ifDefined__default(context._id)}-headerScrollContainer"><ul role="tablist" @focusin=${context._onTablistFocusin} class="${litRender.classMap(context.classes.headerList)}" @click="${context._onHeaderClick}" @keydown="${context._onHeaderKeyDown}" @keyup="${context._onHeaderKeyUp}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block4(item, index, context)) }</ul></div><div class="${litRender.classMap(context.classes.headerForwardArrow)}"><ui5-button @click="${context._onHeaderForwardArrowClick}" icon="slim-arrow-right" design="Transparent" tabindex="-1" title="${ifDefined__default(context.nextIconACCName)}"></ui5-button></div></div><!-- overflow button -->${ context.shouldShowOverflow ? block7(context) : undefined }</div>${ !context.tabsAtTheBottom ? block10(context) : undefined }</div> `; };
	const block1 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.content)}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block2(item)) }</div>`; };
	const block2 = (item, index, context) => { return litRender.html`${ !item.isSeparator ? block3(item) : undefined }`; };
	const block3 = (item, index, context) => { return litRender.html`<div class="ui5-tc__contentItem" id="ui5-tc-contentItem-${ifDefined__default(item._posinset)}" ?hidden="${item.effectiveHidden}" role="tabpanel" aria-labelledby="${ifDefined__default(item._id)}"><slot name="${ifDefined__default(item._individualSlot)}"></slot></div>`; };
	const block4 = (item, index, context) => { return litRender.html`${ !item.isSeparator ? block5(item) : undefined }${ item.isSeparator ? block6(item, index, context) : undefined }`; };
	const block5 = (item, index, context) => { return litRender.html`${ifDefined__default(item.stripPresentation)}`; };
	const block6 = (item, index, context) => { return litRender.html`<li id="${ifDefined__default(item._id)}" role="separator" class="${litRender.classMap(context.classes.separator)}" style="list-style-type: none;"></li>`; };
	const block7 = (context) => { return litRender.html`<div class="ui-tc__overflowButton" @click="${context._onOverflowButtonClick}">${ context.overflowButton.length ? block8() : block9(context) }</div>`; };
	const block8 = (context) => { return litRender.html`<slot name="overflowButton"></slot>`; };
	const block9 = (context) => { return litRender.html`<ui5-button icon="${ifDefined__default(context.overflowMenuIcon)}" design="Transparent" tabindex="-1" title="${ifDefined__default(context.overflowMenuTitle)}" aria-haspopup="true"></ui5-button>`; };
	const block10 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.content)}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block11(item)) }</div>`; };
	const block11 = (item, index, context) => { return litRender.html`${ !item.isSeparator ? block12(item) : undefined }`; };
	const block12 = (item, index, context) => { return litRender.html`<div class="ui5-tc__contentItem" id="ui5-tc-contentItem-${ifDefined__default(item._posinset)}" ?hidden="${item.effectiveHidden}" role="tabpanel" aria-labelledby="${ifDefined__default(item._id)}"><slot name="${ifDefined__default(item._individualSlot)}"></slot></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
