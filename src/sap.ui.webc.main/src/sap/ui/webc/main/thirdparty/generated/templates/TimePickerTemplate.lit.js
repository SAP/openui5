sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}" class="ui5-time-picker-root"><${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(context._id)}-inner" value="${(0, _LitRenderer.ifDefined)(context.value)}" placeholder="${(0, _LitRenderer.ifDefined)(context._placeholder)}" ?disabled="${context.disabled}" ?readonly="${context.readonly}" value-state="${(0, _LitRenderer.ifDefined)(context.valueState)}" ._inputAccInfo="${(0, _LitRenderer.ifDefined)(context.accInfo)}" data-sap-focus-ref @click="${context._handleInputClick}" @ui5-change="${(0, _LitRenderer.ifDefined)(context._handleInputChange)}" @ui5-input="${(0, _LitRenderer.ifDefined)(context._handleInputLiveChange)}" class="ui5-time-picker-input" @keydown="${context._onkeydown}">${context.valueStateMessage.length ? block1(context, tags, suffix) : undefined}${!context.readonly ? block2(context, tags, suffix) : undefined}</${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}" class="ui5-time-picker-root"><ui5-input id="${(0, _LitRenderer.ifDefined)(context._id)}-inner" value="${(0, _LitRenderer.ifDefined)(context.value)}" placeholder="${(0, _LitRenderer.ifDefined)(context._placeholder)}" ?disabled="${context.disabled}" ?readonly="${context.readonly}" value-state="${(0, _LitRenderer.ifDefined)(context.valueState)}" ._inputAccInfo="${(0, _LitRenderer.ifDefined)(context.accInfo)}" data-sap-focus-ref @click="${context._handleInputClick}" @ui5-change="${(0, _LitRenderer.ifDefined)(context._handleInputChange)}" @ui5-input="${(0, _LitRenderer.ifDefined)(context._handleInputLiveChange)}" class="ui5-time-picker-input" @keydown="${context._onkeydown}">${context.valueStateMessage.length ? block1(context, tags, suffix) : undefined}${!context.readonly ? block2(context, tags, suffix) : undefined}</ui5-input></div>`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="valueStateMessage" slot="valueStateMessage"></slot>`;

  const block2 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} slot="icon" name="${(0, _LitRenderer.ifDefined)(context.openIconName)}" tabindex="-1" show-tooltip @click="${context.togglePicker}" input-icon ?pressed="${context._isPickerOpen}" class="ui5-time-picker-input-icon-button"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon slot="icon" name="${(0, _LitRenderer.ifDefined)(context.openIconName)}" tabindex="-1" show-tooltip @click="${context.togglePicker}" input-icon ?pressed="${context._isPickerOpen}" class="ui5-time-picker-input-icon-button"></ui5-icon>`;

  var _default = block0;
  _exports.default = _default;
});