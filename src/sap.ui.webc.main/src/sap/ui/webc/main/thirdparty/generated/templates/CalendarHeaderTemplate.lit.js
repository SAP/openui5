sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-calheader-root" dir="${ifDefined__default(context.effectiveDir)}"><div data-ui5-cal-header-btn-prev class="${litRender.classMap(context.classes.prevButton)}" @mousedown=${context.onPrevButtonClick} title="${ifDefined__default(context._prevButtonText)}"><ui5-icon class="ui5-calheader-arrowicon" name="slim-arrow-left"></ui5-icon></div><div class="ui5-calheader-midcontainer"><div data-ui5-cal-header-btn-month class="ui5-calheader-arrowbtn ui5-calheader-middlebtn" ?hidden="${context.isMonthButtonHidden}" tabindex="0" @click=${context.onMonthButtonClick} @keydown=${context.onMonthButtonKeyDown}>${ifDefined__default(context._monthButtonText)}</div><div data-ui5-cal-header-btn-year class="ui5-calheader-arrowbtn ui5-calheader-middlebtn" tabindex="0" @click=${context.onYearButtonClick} @keydown=${context.onYearButtonKeyDown}>${ifDefined__default(context._yearButtonText)}</div></div><div data-ui5-cal-header-btn-next class="${litRender.classMap(context.classes.nextButton)}" @mousedown=${context.onNextButtonClick} title=${ifDefined__default(context._nextButtonText)}><ui5-icon class="ui5-calheader-arrowicon" name="slim-arrow-right"></ui5-icon></div></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
