sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-dp-root" style="${litRender.styleMap(context.styles.wrapper)}" @keydown=${context._onkeydown} @keyup=${context._onkeyup} @click=${context._onclick} @mouseover=${context._onmouseover} @focusin=${context._onfocusin} @focusout=${context._onfocusout}><div id="${litRender.ifDefined(context._id)}-content" class="ui5-dp-content" role="grid" aria-roledescription="Calendar"><div role="row" class="ui5-dp-days-names-container">${ litRender.repeat(context._dayNames, (item, index) => item._id || index, (item, index) => block1(item)) }</div>${ litRender.repeat(context._weeks, (item, index) => item._id || index, (item, index) => block2(item)) }</div></div>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`<div role="columnheader" aria-label="${litRender.ifDefined(item.name)}" class="${litRender.ifDefined(item.classes)}">${litRender.ifDefined(item.ultraShortName)}</div>`;
	const block2 = (item, index, context, tags, suffix) => litRender.html`${ item.length ? block3(item) : block9() }`;
	const block3 = (item, index, context, tags, suffix) => litRender.html`<div style="display: flex;" role="row">${ litRender.repeat(item, (item, index) => item._id || index, (item, index) => block4(item)) }</div>`;
	const block4 = (item, index, context, tags, suffix) => litRender.html`${ item.timestamp ? block5(item) : block7(item) }`;
	const block5 = (item, index, context, tags, suffix) => litRender.html`<div tabindex="${litRender.ifDefined(item._tabIndex)}" ?data-sap-focus-ref="${item.focusRef}" data-sap-timestamp="${litRender.ifDefined(item.timestamp)}" role="gridcell" aria-selected="${litRender.ifDefined(item.ariaSelected)}" aria-label="${litRender.ifDefined(item.ariaLabel)}" aria-disabled="${litRender.ifDefined(item.ariaDisabled)}" class="${litRender.ifDefined(item.classes)}"><span class="ui5-dp-daytext" data-sap-timestamp="${litRender.ifDefined(item.timestamp)}">${litRender.ifDefined(item.day)}</span>${ item._isSecondaryCalendarType ? block6(item) : undefined }</div>`;
	const block6 = (item, index, context, tags, suffix) => litRender.html`<span class="ui5-dp-daytext ui5-dp-daysectext">${litRender.ifDefined(item.secondDay)}</span>`;
	const block7 = (item, index, context, tags, suffix) => litRender.html`${ !item.isHidden ? block8(item) : undefined }`;
	const block8 = (item, index, context, tags, suffix) => litRender.html`<div class="ui5-dp-weekname-container" role="rowheader" aria-label="Calendar Week ${litRender.ifDefined(item.weekNum)}"><span class="ui5-dp-weekname">${litRender.ifDefined(item.weekNum)}</span></div>`;
	const block9 = (item, index, context, tags, suffix) => litRender.html`<div class="sapWCEmptyWeek"></div>`;

	return block0;

});
