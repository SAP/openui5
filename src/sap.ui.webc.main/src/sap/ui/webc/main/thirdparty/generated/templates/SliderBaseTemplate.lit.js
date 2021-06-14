sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-slider-root" @mousedown="${context._onmousedown}" @touchstart="${context._ontouchstart}" @mouseover="${context._onmouseover}" @mouseout="${context._onmouseout}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" dir="${ifDefined__default(context.effectiveDir)}"><div class="ui5-slider-inner">${ context.step ? block1(context) : undefined }</div><span id="${ifDefined__default(context._id)}-sliderDesc" class="ui5-hidden-text">${ifDefined__default(context._ariaLabelledByText)}</span></div> `; };
	const block1 = (context) => { return litRender.html`${ context.showTickmarks ? block2(context) : undefined }`; };
	const block2 = (context) => { return litRender.html`<div class="ui5-slider-tickmarks" style="${litRender.styleMap(context.styles.tickmarks)}"></div>${ context.labelInterval ? block3(context) : undefined }`; };
	const block3 = (context) => { return litRender.html`<ul class="ui5-slider-labels ${litRender.classMap(context.classes.labelContainer)}" style="${litRender.styleMap(context.styles.labelContainer)}">${ litRender.repeat(context._labels, (item, index) => item._id || index, (item, index) => block4(item, index, context)) }</ul>`; };
	const block4 = (item, index, context) => { return litRender.html`<li style="${litRender.styleMap(context.styles.label)}">${ifDefined__default(item)}</li>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
