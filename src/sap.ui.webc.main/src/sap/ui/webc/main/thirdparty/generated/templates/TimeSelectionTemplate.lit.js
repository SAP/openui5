sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.root)}" tabindex="-1" @keydown=${context._onkeydown} @focusin="${context._onfocusin}" @focusout="${context._onfocusout}">${ context._hasHoursSlider ? block1(context) : undefined }${ context._hasMinutesSlider ? block2(context) : undefined }${ context._hasSecondsSlider ? block3(context) : undefined }${ context._hasPeriodsSlider ? block4(context) : undefined }</div>`; };
	const block1 = (context) => { return litRender.html`<ui5-wheelslider label = "${ifDefined__default(context.hoursSliderTitle)}" ._items="${ifDefined__default(context.hoursArray)}" data-sap-focus-ref ?expanded="${context._hoursSliderFocused}" value="${ifDefined__default(context._hours)}" @ui5-select="${ifDefined__default(context.onHoursChange)}" @click="${context.selectSlider}" @focusin="${context.selectSlider}" data-sap-slider="hours" ?cyclic="${context._isCyclic}"></ui5-wheelslider>`; };
	const block2 = (context) => { return litRender.html`<ui5-wheelslider label = "${ifDefined__default(context.minutesSliderTitle)}" ._items="${ifDefined__default(context.minutesArray)}" ?expanded="${context._minutesSliderFocused}" value="${ifDefined__default(context._minutes)}" @ui5-select="${ifDefined__default(context.onMinutesChange)}" @click="${context.selectSlider}" @focusin="${context.selectSlider}" data-sap-slider="minutes" ?cyclic="${context._isCyclic}"></ui5-wheelslider>`; };
	const block3 = (context) => { return litRender.html`<ui5-wheelslider label = "${ifDefined__default(context.secondsSliderTitle)}" ._items="${ifDefined__default(context.secondsArray)}" ?expanded="${context._secondsSliderFocused}" value="${ifDefined__default(context._seconds)}" @ui5-select="${ifDefined__default(context.onSecondsChange)}" @click="${context.selectSlider}" @focusin="${context.selectSlider}" data-sap-slider="seconds" ?cyclic="${context._isCyclic}"></ui5-wheelslider>`; };
	const block4 = (context) => { return litRender.html`<ui5-wheelslider label = "${ifDefined__default(context.periodSliderTitle)}" ._items="${ifDefined__default(context.periodsArray)}" ?expanded="${context._periodSliderFocused}" value="${ifDefined__default(context._period)}" @ui5-select="${ifDefined__default(context.onPeriodChange)}" @click="${context.selectSlider}" @focusin="${context.selectSlider}" data-sap-slider="period"></ui5-wheelslider>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
