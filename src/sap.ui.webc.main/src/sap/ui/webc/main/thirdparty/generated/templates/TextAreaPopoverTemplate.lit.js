sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`${ context.displayValueStateMessagePopover ? block1(context) : undefined }`; };
	const block1 = (context) => { return litRender.html`<ui5-popover skip-registry-update prevent-focus-restore no-padding hide-arrow _disable-initial-focus class="ui5-valuestatemessage-popover" style="${litRender.styleMap(context.styles.valueStateMsgPopover)}" placement-type="Bottom" horizontal-align="Left"><div slot="header" class="ui5-valuestatemessage-root ${litRender.classMap(context.classes.valueStateMsg)}">${ context.hasCustomValueState ? block2(context) : block4(context) }</div></ui5-popover>`; };
	const block2 = (context) => { return litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block3(item)) }`; };
	const block3 = (item, index, context) => { return litRender.html`${ifDefined__default(item)}`; };
	const block4 = (context) => { return litRender.html`${ifDefined__default(context.valueStateText)}`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
