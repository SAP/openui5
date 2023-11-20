sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-time-selection-inputs" @keydown="${this._onkeydown}">${(0, _LitRenderer.repeat)(this._entities, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}${this._periods.length ? block3.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`${item.hasSeparator ? block2.call(this, context, tags, suffix, item, index) : undefined}<${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}_input_${(0, _LitRenderer.ifDefined)(item.entity)}" data-sap-input="${(0, _LitRenderer.ifDefined)(item.entity)}" type="${(0, _LitRenderer.ifDefined)(this._numberType)}" maxlength="2" autocomplete="off" pattern="[0-9]*" inputmode="numeric" class="ui5-time-selection-numeric-input" .value="${(0, _LitRenderer.ifDefined)(item.stringValue)}" .accessibleName="${(0, _LitRenderer.ifDefined)(item.label)}" ._nativeInputAttributes=${(0, _LitRenderer.ifDefined)(item.attributes)} @focusin=${this._onfocusin} @focusout=${this._onfocusout} @ui5-input=${(0, _LitRenderer.ifDefined)(this._oninput)}></${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)}>` : (0, _LitRenderer.html)`${item.hasSeparator ? block2.call(this, context, tags, suffix, item, index) : undefined}<ui5-input id="${(0, _LitRenderer.ifDefined)(this._id)}_input_${(0, _LitRenderer.ifDefined)(item.entity)}" data-sap-input="${(0, _LitRenderer.ifDefined)(item.entity)}" type="${(0, _LitRenderer.ifDefined)(this._numberType)}" maxlength="2" autocomplete="off" pattern="[0-9]*" inputmode="numeric" class="ui5-time-selection-numeric-input" .value="${(0, _LitRenderer.ifDefined)(item.stringValue)}" .accessibleName="${(0, _LitRenderer.ifDefined)(item.label)}" ._nativeInputAttributes=${(0, _LitRenderer.ifDefined)(item.attributes)} @focusin=${this._onfocusin} @focusout=${this._onfocusout} @ui5-input=${(0, _LitRenderer.ifDefined)(this._oninput)}></ui5-input>`;
  }
  function block2(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<span separator>:</span>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<span separator></span><${(0, _LitRenderer.scopeTag)("ui5-segmented-button", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}_AmPm" @click=${this._periodChange}>${(0, _LitRenderer.repeat)(this._periods, (item, index) => item._id || index, (item, index) => block4.call(this, context, tags, suffix, item, index))}</${(0, _LitRenderer.scopeTag)("ui5-segmented-button", tags, suffix)}>` : (0, _LitRenderer.html)`<span separator></span><ui5-segmented-button id="${(0, _LitRenderer.ifDefined)(this._id)}_AmPm" @click=${this._periodChange}>${(0, _LitRenderer.repeat)(this._periods, (item, index) => item._id || index, (item, index) => block4.call(this, context, tags, suffix, item, index))}</ui5-segmented-button>`;
  }
  function block4(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-segmented-button-item", tags, suffix)} ?pressed=${item.pressed}>${(0, _LitRenderer.ifDefined)(item.label)}</${(0, _LitRenderer.scopeTag)("ui5-segmented-button-item", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-segmented-button-item ?pressed=${item.pressed}>${(0, _LitRenderer.ifDefined)(item.label)}</ui5-segmented-button-item>`;
  }
  var _default = block0;
  _exports.default = _default;
});