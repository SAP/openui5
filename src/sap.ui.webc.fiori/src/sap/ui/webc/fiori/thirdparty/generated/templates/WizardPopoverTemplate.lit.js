sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-responsive-popover horizontal-align="Center" placement-type="Bottom" aria-label="${ifDefined__default(context.actionSheetStepsText)}" class="${litRender.classMap(context.classes.popover)}" @ui5-after-close=${ifDefined__default(context._afterClosePopover)} content-only-on-desktop prevent-focus-restore with-padding _hide-header><ul class="ui5-wizard-responsive-popover-list">${ litRender.repeat(context._groupedTabs, (item, index) => item._id || index, (item, index) => block1(item, index, context)) }</ul><div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${context._closeRespPopover}">Cancel</ui5-button></div></ui5-responsive-popover>`; };
	const block1 = (item, index, context) => { return litRender.html`<li><ui5-button icon="${ifDefined__default(item.icon)}" ?disabled="${item.disabled}" design="Transparent" data-ui5-header-tab-ref-id="${ifDefined__default(item.pos)}" @click="${context._onOverflowStepButtonClick}">${ifDefined__default(item.heading)}</ui5-button></li>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
