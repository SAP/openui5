sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}" class="ui5-time-picker-root" @keydown="${context._onkeydown}"><${litRender.scopeTag("ui5-input", tags, suffix)} id="${litRender.ifDefined(context._id)}-inner" value="${litRender.ifDefined(context.value)}" placeholder="${litRender.ifDefined(context._placeholder)}" ?disabled="${context.disabled}" ?readonly="${context.readonly}" value-state="${litRender.ifDefined(context.valueState)}" ._inputAccInfo="${litRender.ifDefined(context.accInfo)}" @click="${context._handleInputClick}" @ui5-change="${litRender.ifDefined(context._handleInputChange)}" @ui5-input="${litRender.ifDefined(context._handleInputLiveChange)}" class="ui5-time-picker-input">${ context.valueStateMessage.length ? block1() : undefined }${ !context.readonly ? block2(context, tags, suffix) : undefined }</${litRender.scopeTag("ui5-input", tags, suffix)}></div>`;
	const block1 = (context, tags, suffix) => litRender.html`<slot name="valueStateMessage" slot="valueStateMessage"></slot>`;
	const block2 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} slot="icon" name="${litRender.ifDefined(context.openIconName)}" tabindex="-1" show-tooltip @click="${context.togglePicker}" input-icon ?pressed="${context._isPickerOpen}" class="ui5-time-picker-input-icon-button"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;

	return block0;

});
