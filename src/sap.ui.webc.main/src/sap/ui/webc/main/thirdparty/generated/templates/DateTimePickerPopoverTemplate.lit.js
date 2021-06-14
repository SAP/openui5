sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-responsive-popover id="${ifDefined__default(context._id)}-responsive-popover" allow-target-overlap stay-open-on-scroll placement-type="Bottom" horizontal-align="Left" ?disable-scrolling="${context._isIE}" hide-arrow with-padding no-stretch ?_hide-header=${ifDefined__default(context._shouldHideHeader)} @keydown="${context._onkeydown}" @ui5-after-close="${ifDefined__default(context.onResponsivePopoverAfterClose)}">${ context.showHeader ? block1(context) : undefined }<div class="ui5-dt-picker-content ${litRender.classMap(context.classes.picker)}"><ui5-calendar class="ui5-dt-cal ${litRender.classMap(context.classes.dateTimeView)}" id="${ifDefined__default(context._id)}-calendar" primary-calendar-type="${ifDefined__default(context._primaryCalendarType)}" format-pattern="${ifDefined__default(context._formatPattern)}" timestamp="${ifDefined__default(context._calendarTimestamp)}" .selectionMode="${ifDefined__default(context._calendarSelectionMode)}" .minDate="${ifDefined__default(context.minDate)}" .maxDate="${ifDefined__default(context.maxDate)}" @ui5-selected-dates-change="${ifDefined__default(context.onSelectedDatesChange)}" ?hide-week-numbers="${context.hideWeekNumbers}" ._currentPicker="${ifDefined__default(context._calendarCurrentPicker)}">${ litRender.repeat(context._calendarSelectedDates, (item, index) => item._id || index, (item, index) => block3(item)) }</ui5-calendar>${ !context.phone ? block4() : undefined }<ui5-time-selection id="${ifDefined__default(context._id)}-time-sel" class="ui5-dt-time ${litRender.classMap(context.classes.dateTimeView)}" value="${ifDefined__default(context._timeSelectionValue)}" format-pattern="${ifDefined__default(context._formatPattern)}" ._currentSlider="${ifDefined__default(context._currentTimeSlider)}" @ui5-change="${ifDefined__default(context.onTimeSelectionChange)}" @ui5-slider-change="${ifDefined__default(context.onTimeSliderChange)}"></ui5-time-selection></div>${ context.showFooter ? block5(context) : undefined }</ui5-responsive-popover> `; };
	const block1 = (context) => { return litRender.html`${ context.phone ? block2(context) : undefined }`; };
	const block2 = (context) => { return litRender.html`<div class="ui5-dt-picker-header"><ui5-segmented-button style="width: 8rem"><ui5-toggle-button key="Date" ?pressed="${context.showDateView}" @click="${context._dateTimeSwitchChange}">${ifDefined__default(context.btnDateLabel)}</ui5-toggle-button><ui5-toggle-button key="Time" ?pressed="${context.showTimeView}" @click="${context._dateTimeSwitchChange}">${ifDefined__default(context.btnTimeLabel)}</ui5-toggle-button></ui5-segmented-button></div>`; };
	const block3 = (item, index, context) => { return litRender.html`<ui5-date value="${ifDefined__default(item)}"></ui5-date>`; };
	const block4 = (context) => { return litRender.html`<span class="ui5-dt-picker-separator"></span>`; };
	const block5 = (context) => { return litRender.html`<div slot="footer" class="ui5-dt-picker-footer"><ui5-button id="ok" class="ui5-dt-picker-action" design="Emphasized" ?disabled="${context._submitDisabled}" @click="${context._submitClick}">${ifDefined__default(context.btnOKLabel)}</ui5-button><ui5-button id="cancel" class="ui5-dt-picker-action" design="Transparent" @click="${context._cancelClick}">${ifDefined__default(context.btnCancelLabel)}</ui5-button></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
