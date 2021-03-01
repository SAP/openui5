sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.root)}"><div role="region" class="${litRender.classMap(context.classes.columns.start)}" aria-labelledby="${ifDefined__default(context._id)}-startColumnText"><slot name="startColumn"></slot></div><div class="ui5-fcl-arrow-container" style="${litRender.styleMap(context.styles.arrowsContainer.start)}"><ui5-button class="ui5-fcl-arrow ui5-fcl-arrow--start" icon="slim-arrow-right" design="Transparent" @click="${context.startArrowClick}" style="${litRender.styleMap(context.styles.arrows.start)}" aria-label="${ifDefined__default(context.accStartArrowText)}" title="${ifDefined__default(context.accStartArrowText)}"></ui5-button></div><div role="region" class="${litRender.classMap(context.classes.columns.middle)}" aria-labelledby="${ifDefined__default(context._id)}-midColumnText"><slot name="midColumn"></slot></div><div class="ui5-fcl-arrow-container" style="${litRender.styleMap(context.styles.arrowsContainer.end)}"><ui5-button class="ui5-fcl-arrow ui5-fcl-arrow--end" style="${litRender.styleMap(context.styles.arrows.end)}" icon="slim-arrow-left" design="Transparent" @click="${context.endArrowClick}" aria-label="${ifDefined__default(context.accEndArrowText)}" title="${ifDefined__default(context.accEndArrowText)}"></ui5-button></div><div role="region" class="${litRender.classMap(context.classes.columns.end)}" aria-labelledby="${ifDefined__default(context._id)}-endColumnText"><slot name="endColumn"></slot></div><span id="${ifDefined__default(context._id)}-startColumnText" class="ui5-hidden-text">${ifDefined__default(context.accStartColumnText)}</span><span id="${ifDefined__default(context._id)}-midColumnText" class="ui5-hidden-text">${ifDefined__default(context.accMiddleColumnText)}</span><span id="${ifDefined__default(context._id)}-endColumnText" class="ui5-hidden-text">${ifDefined__default(context.accEndColumnText)}</span></div> `; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
