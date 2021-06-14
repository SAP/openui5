sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-responsive-popover id="${ifDefined__default(context._id)}-responsive-popover" class="ui5-time-picker-popover" placement-type="Bottom" horizontal-align="Left" allow-target-overlap _hide-header hide-arrow no-stretch stay-open-on-scroll @ui5-after-close="${ifDefined__default(context.onResponsivePopoverAfterClose)}" @wheel="${context._handleWheel}"><ui5-time-selection id="${ifDefined__default(context._id)}-time-sel" value="${ifDefined__default(context._timeSelectionValue)}" format-pattern="${ifDefined__default(context._formatPattern)}" .hideHours="${ifDefined__default(context.hideHours)}" .hideMinutes="${ifDefined__default(context.hideMinutes)}" .hideSeconds="${ifDefined__default(context.hideSeconds)}" .minutesStep="${ifDefined__default(context.minutesStep)}" .secondsStep="${ifDefined__default(context.secondsStep)}" .maxHours="${ifDefined__default(context.maxHours)}" .maxMinutes="${ifDefined__default(context.maxMinutes)}" .maxSeconds="${ifDefined__default(context.maxSeconds)}" @ui5-change="${ifDefined__default(context.onTimeSelectionChange)}"></ui5-time-selection><div slot="footer" class="ui5-time-picker-footer" @keydown=${context._onfooterkeydown}><ui5-button id="submit" design="Emphasized" @click="${context.submitPickers}">${ifDefined__default(context.submitButtonLabel)}</ui5-button><ui5-button id="close" design="Transparent" @click="${context.closePicker}">${ifDefined__default(context.cancelButtonLabel)}</ui5-button></div></ui5-responsive-popover>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
