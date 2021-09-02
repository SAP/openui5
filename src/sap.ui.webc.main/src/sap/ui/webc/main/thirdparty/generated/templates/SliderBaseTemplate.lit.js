sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-slider-root" @mousedown="${context._onmousedown}" @touchstart="${context._ontouchstart}" @mouseover="${context._onmouseover}" @mouseout="${context._onmouseout}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" dir="${litRender.ifDefined(context.effectiveDir)}"><div class="ui5-slider-inner">${ context.step ? block1(context) : undefined }</div><span id="${litRender.ifDefined(context._id)}-sliderDesc" class="ui5-hidden-text">${litRender.ifDefined(context._ariaLabelledByText)}</span></div> `;
	const block1 = (context, tags, suffix) => litRender.html`${ context.showTickmarks ? block2(context) : undefined }`;
	const block2 = (context, tags, suffix) => litRender.html`<div class="ui5-slider-tickmarks" style="${litRender.styleMap(context.styles.tickmarks)}"></div>${ context.labelInterval ? block3(context) : undefined }`;
	const block3 = (context, tags, suffix) => litRender.html`<ul class="ui5-slider-labels ${litRender.classMap(context.classes.labelContainer)}" style="${litRender.styleMap(context.styles.labelContainer)}">${ litRender.repeat(context._labels, (item, index) => item._id || index, (item, index) => block4(item, index, context)) }</ul>`;
	const block4 = (item, index, context, tags, suffix) => litRender.html`<li style="${litRender.styleMap(context.styles.label)}">${litRender.ifDefined(item)}</li>`;

	return block0;

});
