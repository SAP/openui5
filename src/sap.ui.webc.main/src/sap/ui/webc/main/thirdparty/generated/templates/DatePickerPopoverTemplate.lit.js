sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-responsive-popover id="${ifDefined__default(context._id)}-responsive-popover" allow-target-overlap stay-open-on-scroll placement-type="Bottom" horizontal-align="Left" ?disable-scrolling="${context._isIE}" hide-arrow with-padding no-stretch ?_hide-header=${ifDefined__default(context._shouldHideHeader)} @keydown="${context._onkeydown}" @ui5-after-close="${ifDefined__default(context.onResponsivePopoverAfterClose)}">${ context.showHeader ? block1(context) : undefined }<ui5-calendar id="${ifDefined__default(context._id)}-calendar" primary-calendar-type="${ifDefined__default(context._primaryCalendarType)}" format-pattern="${ifDefined__default(context._formatPattern)}" timestamp="${ifDefined__default(context._calendarTimestamp)}" .selectionMode="${ifDefined__default(context._calendarSelectionMode)}" .minDate="${ifDefined__default(context.minDate)}" .maxDate="${ifDefined__default(context.maxDate)}" @ui5-selected-dates-change="${ifDefined__default(context.onSelectedDatesChange)}" ?hide-week-numbers="${context.hideWeekNumbers}" ._currentPicker="${ifDefined__default(context._calendarCurrentPicker)}">${ litRender.repeat(context._calendarSelectedDates, (item, index) => item._id || index, (item, index) => block2(item)) }</ui5-calendar>${ context.showFooter ? block3() : undefined }</ui5-responsive-popover> `; };
	const block1 = (context) => { return litRender.html`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${ifDefined__default(context._headerTitleText)}</span><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${context.closePicker}"></ui5-button></div></div>`; };
	const block2 = (item, index, context) => { return litRender.html`<ui5-date value="${ifDefined__default(item)}"></ui5-date>`; };
	const block3 = (context) => { return litRender.html``; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
