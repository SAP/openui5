sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-textarea-root" style="${litRender.styleMap(context.styles.main)}" ?aria-invalid="${context.ariaInvalid}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}">${ context.growing ? block1(context) : undefined }<textarea id="${litRender.ifDefined(context._id)}-inner" class="ui5-textarea-inner" placeholder="${litRender.ifDefined(context.placeholder)}" ?disabled="${context.disabled}" ?readonly="${context.readonly}" aria-label="${litRender.ifDefined(context.ariaLabelText)}" aria-describedby="${litRender.ifDefined(context.ariaDescribedBy)}" aria-required="${litRender.ifDefined(context.required)}" maxlength="${litRender.ifDefined(context._exceededTextProps.calcedMaxLength)}" .value="${litRender.ifDefined(context.value)}" @input="${context._oninput}" @change="${context._onchange}" @keyup="${context._onkeyup}" @keydown="${context._onkeydown}" data-sap-focus-ref part="textarea"></textarea>${ context.showExceededText ? block3(context) : undefined }${ context.hasValueState ? block4(context) : undefined }<slot name="formSupport"></slot></div> `;
	const block1 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}-mirror" style="${litRender.styleMap(context.styles.mirror)}" class="ui5-textarea-mirror" aria-hidden="true">${ litRender.repeat(context._mirrorText, (item, index) => item._id || index, (item, index) => block2(item)) }</div>`;
	const block2 = (item, index, context, tags, suffix) => litRender.html`${litRender.ifDefined(item.text)}<br />`;
	const block3 = (context, tags, suffix) => litRender.html`<span class="ui5-textarea-exceeded-text">${litRender.ifDefined(context._exceededTextProps.exceededText)}</span>`;
	const block4 = (context, tags, suffix) => litRender.html`<span id="${litRender.ifDefined(context._id)}-valueStateDesc" class="ui5-hidden-text">${litRender.ifDefined(context.ariaValueStateHiddenText)}</span>`;

	return block0;

});
