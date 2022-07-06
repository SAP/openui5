sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-slider-root ${litRender.classMap(context.classes.root)}" @mousedown="${context._onmousedown}" @touchstart="${context._ontouchstart}" @mouseover="${context._onmouseover}" @mouseout="${context._onmouseout}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" part="root-container"><div class="ui5-slider-inner">${ context.step ? block1(context) : undefined }</div><span id="${litRender.ifDefined(context._id)}-accName" class="ui5-hidden-text">${litRender.ifDefined(context.accessibleName)}</span><span id="${litRender.ifDefined(context._id)}-sliderDesc" class="ui5-hidden-text">${litRender.ifDefined(context._ariaLabelledByText)}</span></div> `;
	const block1 = (context, tags, suffix) => litRender.html`${ context.showTickmarks ? block2(context) : undefined }`;
	const block2 = (context, tags, suffix) => litRender.html`<ul class="ui5-slider-tickmarks">${ litRender.repeat(context.tickmarksObject, (item, index) => item._id || index, (item, index) => block3(item)) }</ul>${ context.labelInterval ? block6(context) : undefined }`;
	const block3 = (item, index, context, tags, suffix) => litRender.html`${ item ? block4() : block5() }`;
	const block4 = (item, index, context, tags, suffix) => litRender.html`<li class="ui5-slider-tickmark ui5-slider-tickmark-in-range"></li>`;
	const block5 = (item, index, context, tags, suffix) => litRender.html`<li class="ui5-slider-tickmark"></li>`;
	const block6 = (context, tags, suffix) => litRender.html`<ul class="ui5-slider-labels ${litRender.classMap(context.classes.labelContainer)}" style="${litRender.styleMap(context.styles.labelContainer)}">${ litRender.repeat(context._labels, (item, index) => item._id || index, (item, index) => block7(item, index, context)) }</ul>`;
	const block7 = (item, index, context, tags, suffix) => litRender.html`<li style="${litRender.styleMap(context.styles.label)}">${litRender.ifDefined(item)}</li>`;

	return block0;

});
