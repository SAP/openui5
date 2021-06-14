sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<label class="ui5-label-root" dir="${ifDefined__default(context.effectiveDir)}" @click=${context._onclick} for="${ifDefined__default(context.for)}"><span class="${litRender.classMap(context.classes.textWrapper)}"><bdi id="${ifDefined__default(context._id)}-bdi"><slot></slot></bdi></span><span class="ui5-label-required-colon"></span></label>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
