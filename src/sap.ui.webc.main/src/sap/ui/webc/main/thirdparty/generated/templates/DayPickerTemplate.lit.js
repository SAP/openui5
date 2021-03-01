sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-dp-root" style="${litRender.styleMap(context.styles.wrapper)}" @keydown=${context._onkeydown} @keyup=${context._onkeyup} @click=${context._onclick} @mouseover=${context._onmouseover} @focusin=${context._onfocusin}><div id="${ifDefined__default(context._id)}-content" class="ui5-dp-content" role="grid" aria-roledescription="Calendar"><div role="row" class="ui5-dp-days-names-container">${ litRender.repeat(context._dayNames, (item, index) => item._id || index, (item, index) => block1(item)) }</div>${ litRender.repeat(context._weeks, (item, index) => item._id || index, (item, index) => block2(item)) }</div></div>`; };
	const block1 = (item, index, context) => { return litRender.html`<div role="columnheader" aria-label="${ifDefined__default(item.name)}" class="${ifDefined__default(item.classes)}">${ifDefined__default(item.ultraShortName)}</div>`; };
	const block2 = (item, index, context) => { return litRender.html`${ item.length ? block3(item) : block8() }`; };
	const block3 = (item, index, context) => { return litRender.html`<div style="display: flex;" role="row">${ litRender.repeat(item, (item, index) => item._id || index, (item, index) => block4(item)) }</div>`; };
	const block4 = (item, index, context) => { return litRender.html`${ item.timestamp ? block5(item) : block6(item) }`; };
	const block5 = (item, index, context) => { return litRender.html`<div tabindex="${ifDefined__default(item._tabIndex)}" ?data-sap-focus-ref="${item.focusRef}" data-sap-timestamp="${ifDefined__default(item.timestamp)}" role="gridcell" aria-selected="${ifDefined__default(item.ariaSelected)}" aria-label="${ifDefined__default(item.ariaLabel)}" aria-disabled="${ifDefined__default(item.ariaDisabled)}" class="${ifDefined__default(item.classes)}"><span class="ui5-dp-daytext" data-sap-timestamp="${ifDefined__default(item.timestamp)}">${ifDefined__default(item.iDay)}</span></div>`; };
	const block6 = (item, index, context) => { return litRender.html`${ !item.isHidden ? block7(item) : undefined }`; };
	const block7 = (item, index, context) => { return litRender.html`<div class="ui5-dp-weekname-container" role="rowheader" aria-label="Calendar Week ${ifDefined__default(item.weekNum)}"><span class="ui5-dp-weekname">${ifDefined__default(item.weekNum)}</span></div>`; };
	const block8 = (item, index, context) => { return litRender.html`<div class="sapWCEmptyWeek"></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
