sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-date-picker-root" style="${(0, _LitRenderer.styleMap)(this.styles.main)}"><${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}-inner" class="ui5-date-picker-input" placeholder="${(0, _LitRenderer.ifDefined)(this._placeholder)}" type="${(0, _LitRenderer.ifDefined)(this.type)}" value="${(0, _LitRenderer.ifDefined)(this.value)}" ?disabled="${this.disabled}" ?required="${this.required}" ?readonly="${this.readonly}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" data-sap-focus-ref ._inputAccInfo ="${(0, _LitRenderer.ifDefined)(this.accInfo)}" @ui5-change="${(0, _LitRenderer.ifDefined)(this._onInputChange)}" @ui5-input="${(0, _LitRenderer.ifDefined)(this._onInputInput)}" @ui5-submit="${(0, _LitRenderer.ifDefined)(this._onInputSubmit)}" @keydown="${this._onkeydown}">${this.valueStateMessage.length ? block1.call(this, context, tags, suffix) : undefined}${!this.readonly ? block2.call(this, context, tags, suffix) : undefined}</${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)}><slot name="formSupport"></slot></div>` : (0, _LitRenderer.html)`<div class="ui5-date-picker-root" style="${(0, _LitRenderer.styleMap)(this.styles.main)}"><ui5-input id="${(0, _LitRenderer.ifDefined)(this._id)}-inner" class="ui5-date-picker-input" placeholder="${(0, _LitRenderer.ifDefined)(this._placeholder)}" type="${(0, _LitRenderer.ifDefined)(this.type)}" value="${(0, _LitRenderer.ifDefined)(this.value)}" ?disabled="${this.disabled}" ?required="${this.required}" ?readonly="${this.readonly}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" data-sap-focus-ref ._inputAccInfo ="${(0, _LitRenderer.ifDefined)(this.accInfo)}" @ui5-change="${(0, _LitRenderer.ifDefined)(this._onInputChange)}" @ui5-input="${(0, _LitRenderer.ifDefined)(this._onInputInput)}" @ui5-submit="${(0, _LitRenderer.ifDefined)(this._onInputSubmit)}" @keydown="${this._onkeydown}">${this.valueStateMessage.length ? block1.call(this, context, tags, suffix) : undefined}${!this.readonly ? block2.call(this, context, tags, suffix) : undefined}</ui5-input><slot name="formSupport"></slot></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="valueStateMessage" slot="valueStateMessage"></slot>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} slot="icon" name="${(0, _LitRenderer.ifDefined)(this.openIconName)}" tabindex="-1" accessible-name="${(0, _LitRenderer.ifDefined)(this.openIconTitle)}" accessible-role="button" aria-hidden="${(0, _LitRenderer.ifDefined)(this._ariaHidden)}" show-tooltip @click="${this.togglePicker}" input-icon ?pressed="${this._isPickerOpen}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon slot="icon" name="${(0, _LitRenderer.ifDefined)(this.openIconName)}" tabindex="-1" accessible-name="${(0, _LitRenderer.ifDefined)(this.openIconTitle)}" accessible-role="button" aria-hidden="${(0, _LitRenderer.ifDefined)(this._ariaHidden)}" show-tooltip @click="${this.togglePicker}" input-icon ?pressed="${this._isPickerOpen}"></ui5-icon>`;
  }
  var _default = block0;
  _exports.default = _default;
});