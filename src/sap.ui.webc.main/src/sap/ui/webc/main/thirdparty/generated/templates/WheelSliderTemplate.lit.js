sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}" ?disabled= "${ifDefined__default(context.disabled)}" value = "${ifDefined__default(context.value)}" label = "${ifDefined__default(context.label)}" @click = ${ifDefined__default(context._onclick)} @keydown=${context._onkeydown} class = "${litRender.classMap(context.classes.root)}" data-sap-focus-ref tabindex="0" @wheel="${context._handleWheel}"><div class="ui5-wheelslider-header-block"><div id="${ifDefined__default(context._id)}--label" class="ui5-wheelslider-label">${ifDefined__default(context.label)}</div><div class="ui5-wheelslider-invisible-text"></div><ui5-button class="ui5-wheelslider-arrow" icon="navigation-up-arrow" @click=${context._onArrowUp} tabindex="-1"></ui5-button></div><div id="${ifDefined__default(context._id)}--inner" class="ui5-wheelslider-inner"><div id="${ifDefined__default(context._id)}--selection-frame" class="ui5-wheelslider-selection-frame"></div><div id="${ifDefined__default(context._id)}--wrapper" class="ui5-wheelslider-wrapper">${ context.expanded ? block1(context) : block3(context) }</div></div><div class="ui5-wheelslider-footer-block"><ui5-button class="ui5-wheelslider-arrow" icon="navigation-down-arrow" @click=${context._onArrowDown} tabindex="-1"></ui5-button></div></div>`; };
	const block1 = (context) => { return litRender.html`<ul id="${ifDefined__default(context._id)}--items-list" role="listbox" aria-label="${ifDefined__default(context.label)}">${ litRender.repeat(context._itemsToShow, (item, index) => item._id || index, (item, index) => block2(item, index)) }</ul>`; };
	const block2 = (item, index, context) => { return litRender.html`<li class="ui5-wheelslider-item" data-item-index="${index}" role="option" aria-selected="${ifDefined__default(item.selected)}" style="list-style-type: none;">${ifDefined__default(item.value)}</li>`; };
	const block3 = (context) => { return litRender.html`<ul id="${ifDefined__default(context._id)}--items-list" role="listbox" aria-label="${ifDefined__default(context.label)}"><li class="ui5-wheelslider-item" role="option" aria-selected="true" style="list-style-type: none;">${ifDefined__default(context.value)}</li></ul>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
