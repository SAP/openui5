sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}" class="ui5-time-picker-root"><${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}-inner" value="${(0, _LitRenderer.ifDefined)(this.value)}" placeholder="${(0, _LitRenderer.ifDefined)(this._placeholder)}" ?disabled="${this.disabled}" ?readonly="${this.readonly}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" ._inputAccInfo="${(0, _LitRenderer.ifDefined)(this.accInfo)}" data-sap-focus-ref @click="${this._handleInputClick}" @ui5-change="${(0, _LitRenderer.ifDefined)(this._handleInputChange)}" @ui5-input="${(0, _LitRenderer.ifDefined)(this._handleInputLiveChange)}" @focusin="${this._onfocusin}" @input="${this._oninput}" class="ui5-time-picker-input" @keydown="${this._onkeydown}">${this.valueStateMessage.length ? block1.call(this, context, tags, suffix) : undefined}${!this.readonly ? block2.call(this, context, tags, suffix) : undefined}</${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}" class="ui5-time-picker-root"><ui5-input id="${(0, _LitRenderer.ifDefined)(this._id)}-inner" value="${(0, _LitRenderer.ifDefined)(this.value)}" placeholder="${(0, _LitRenderer.ifDefined)(this._placeholder)}" ?disabled="${this.disabled}" ?readonly="${this.readonly}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" ._inputAccInfo="${(0, _LitRenderer.ifDefined)(this.accInfo)}" data-sap-focus-ref @click="${this._handleInputClick}" @ui5-change="${(0, _LitRenderer.ifDefined)(this._handleInputChange)}" @ui5-input="${(0, _LitRenderer.ifDefined)(this._handleInputLiveChange)}" @focusin="${this._onfocusin}" @input="${this._oninput}" class="ui5-time-picker-input" @keydown="${this._onkeydown}">${this.valueStateMessage.length ? block1.call(this, context, tags, suffix) : undefined}${!this.readonly ? block2.call(this, context, tags, suffix) : undefined}</ui5-input></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="valueStateMessage" slot="valueStateMessage"></slot>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} slot="icon" name="${(0, _LitRenderer.ifDefined)(this.openIconName)}" tabindex="-1" show-tooltip @click="${this.togglePicker}" input-icon ?pressed="${this._isPickerOpen}" class="ui5-time-picker-input-icon-button"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon slot="icon" name="${(0, _LitRenderer.ifDefined)(this.openIconName)}" tabindex="-1" show-tooltip @click="${this.togglePicker}" input-icon ?pressed="${this._isPickerOpen}" class="ui5-time-picker-input-icon-button"></ui5-icon>`;
  }
  var _default = block0;
  _exports.default = _default;
});