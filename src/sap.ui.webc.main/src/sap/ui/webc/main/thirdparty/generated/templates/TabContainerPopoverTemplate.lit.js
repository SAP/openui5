sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-responsive-popover id="${ifDefined__default(context._id)}-overflowMenu" horizontal-align="Right" placement-type="Bottom" content-only-on-desktop with-padding hide-arrow _hide-header><ui5-list @ui5-item-press="${ifDefined__default(context._onOverflowListItemSelect)}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block1(item)) }</ui5-list><div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${context._closeRespPopover}">Cancel</ui5-button></div></ui5-responsive-popover>`; };
	const block1 = (item, index, context) => { return litRender.html`${ !item.isSeparator ? block2(item) : undefined }`; };
	const block2 = (item, index, context) => { return litRender.html`${ifDefined__default(item.overflowPresentation)}`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
