sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-timeline-root" @focusin=${context._onfocusin}><ul class="ui5-timeline-list" role="listbox" aria-live="polite" aria-label="${ifDefined__default(context.ariaLabel)}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block1(item)) }</ul></div>`; };
	const block1 = (item, index, context) => { return litRender.html`<li class="ui5-timeline-list-item" style="list-style-type: none;"><slot name="${ifDefined__default(item._individualSlot)}"></slot></li>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
