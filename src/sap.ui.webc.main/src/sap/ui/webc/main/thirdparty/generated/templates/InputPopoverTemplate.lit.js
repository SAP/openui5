sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.showSuggestions ? block1.call(this, context, tags, suffix) : undefined}${this.hasValueStateMessage ? block17.call(this, context, tags, suffix) : undefined} `;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)} class="${(0, _LitRenderer.classMap)(this.classes.popover)}" hide-arrow _disable-initial-focus placement-type="Bottom" horizontal-align="Left" style="${(0, _LitRenderer.styleMap)(this.styles.suggestionsPopover)}" @ui5-after-open="${(0, _LitRenderer.ifDefined)(this._afterOpenPopover)}" @ui5-after-close="${(0, _LitRenderer.ifDefined)(this._afterClosePopover)}" @ui5-scroll="${(0, _LitRenderer.ifDefined)(this._scroll)}">${this._isPhone ? block2.call(this, context, tags, suffix) : undefined}${!this._isPhone ? block7.call(this, context, tags, suffix) : undefined}<${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)} separators="${(0, _LitRenderer.ifDefined)(this.suggestionSeparators)}" @mousedown="${this.onItemMouseDown}" mode="SingleSelect">${(0, _LitRenderer.repeat)(this.suggestionObjects, (item, index) => item._id || index, (item, index) => block12.call(this, context, tags, suffix, item, index))}</${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)}>${this._isPhone ? block16.call(this, context, tags, suffix) : undefined}</${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-responsive-popover class="${(0, _LitRenderer.classMap)(this.classes.popover)}" hide-arrow _disable-initial-focus placement-type="Bottom" horizontal-align="Left" style="${(0, _LitRenderer.styleMap)(this.styles.suggestionsPopover)}" @ui5-after-open="${(0, _LitRenderer.ifDefined)(this._afterOpenPopover)}" @ui5-after-close="${(0, _LitRenderer.ifDefined)(this._afterClosePopover)}" @ui5-scroll="${(0, _LitRenderer.ifDefined)(this._scroll)}">${this._isPhone ? block2.call(this, context, tags, suffix) : undefined}${!this._isPhone ? block7.call(this, context, tags, suffix) : undefined}<ui5-list separators="${(0, _LitRenderer.ifDefined)(this.suggestionSeparators)}" @mousedown="${this.onItemMouseDown}" mode="SingleSelect">${(0, _LitRenderer.repeat)(this.suggestionObjects, (item, index) => item._id || index, (item, index) => block12.call(this, context, tags, suffix, item, index))}</ui5-list>${this._isPhone ? block16.call(this, context, tags, suffix) : undefined}</ui5-responsive-popover>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${(0, _LitRenderer.ifDefined)(this._headerTitleText)}</span><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${this._closeRespPopover}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div><div class="row"><div class="input-root-phone native-input-wrapper"><${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)} class="ui5-input-inner-phone" type="${(0, _LitRenderer.ifDefined)(this.inputType)}" .value="${(0, _LitRenderer.ifDefined)(this.value)}" ?show-clear-icon=${this.showClearIcon} placeholder="${(0, _LitRenderer.ifDefined)(this.placeholder)}" @ui5-input="${(0, _LitRenderer.ifDefined)(this._handleInput)}" @ui5-change="${(0, _LitRenderer.ifDefined)(this._handleChange)}"></${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)}></div></div>${this.hasValueStateMessage ? block3.call(this, context, tags, suffix) : undefined}</div>` : (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${(0, _LitRenderer.ifDefined)(this._headerTitleText)}</span><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${this._closeRespPopover}"></ui5-button></div><div class="row"><div class="input-root-phone native-input-wrapper"><ui5-input class="ui5-input-inner-phone" type="${(0, _LitRenderer.ifDefined)(this.inputType)}" .value="${(0, _LitRenderer.ifDefined)(this.value)}" ?show-clear-icon=${this.showClearIcon} placeholder="${(0, _LitRenderer.ifDefined)(this.placeholder)}" @ui5-input="${(0, _LitRenderer.ifDefined)(this._handleInput)}" @ui5-change="${(0, _LitRenderer.ifDefined)(this._handleChange)}"></ui5-input></div></div>${this.hasValueStateMessage ? block3.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.suggestionPopoverHeader)}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.shouldDisplayDefaultValueStateMessage ? block4.call(this, context, tags, suffix) : block5.call(this, context, tags, suffix)}</div>` : (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.suggestionPopoverHeader)}"><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></ui5-icon>${this.shouldDisplayDefaultValueStateMessage ? block4.call(this, context, tags, suffix) : block5.call(this, context, tags, suffix)}</div>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateText)}`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block6.call(this, context, tags, suffix, item, index))}`;
  }
  function block6(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  function block7(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.hasValueStateMessage ? block8.call(this, context, tags, suffix) : undefined}`;
  }
  function block8(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="header" ?focused=${this._isValueStateFocused} class="ui5-responsive-popover-header ${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style=${(0, _LitRenderer.styleMap)(this.styles.suggestionPopoverHeader)}><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.shouldDisplayDefaultValueStateMessage ? block9.call(this, context, tags, suffix) : block10.call(this, context, tags, suffix)}</div>` : (0, _LitRenderer.html)`<div slot="header" ?focused=${this._isValueStateFocused} class="ui5-responsive-popover-header ${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style=${(0, _LitRenderer.styleMap)(this.styles.suggestionPopoverHeader)}><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></ui5-icon>${this.shouldDisplayDefaultValueStateMessage ? block9.call(this, context, tags, suffix) : block10.call(this, context, tags, suffix)}</div>`;
  }
  function block9(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateText)}`;
  }
  function block10(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block11.call(this, context, tags, suffix, item, index))}`;
  }
  function block11(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  function block12(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${item.groupItem ? block13.call(this, context, tags, suffix, item, index) : block14.call(this, context, tags, suffix, item, index)}`;
  }
  function block13(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-li-groupheader", tags, suffix)} data-ui5-key="${(0, _LitRenderer.ifDefined)(item.key)}">${(0, _LitRenderer.unsafeHTML)(item.text)}</${(0, _LitRenderer.scopeTag)("ui5-li-groupheader", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-li-groupheader data-ui5-key="${(0, _LitRenderer.ifDefined)(item.key)}">${(0, _LitRenderer.unsafeHTML)(item.text)}</ui5-li-groupheader>`;
  }
  function block14(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-li-suggestion-item", tags, suffix)} wrapping-type="Normal" image="${(0, _LitRenderer.ifDefined)(item.image)}" icon="${(0, _LitRenderer.ifDefined)(item.icon)}" additional-text="${(0, _LitRenderer.ifDefined)(item.additionalText)}" type="${(0, _LitRenderer.ifDefined)(item.type)}" additional-text-state="${(0, _LitRenderer.ifDefined)(item.additionalTextState)}" data-ui5-key="${(0, _LitRenderer.ifDefined)(item.key)}">${(0, _LitRenderer.unsafeHTML)(item.text)}${item.description ? block15.call(this, context, tags, suffix, item, index) : undefined}</${(0, _LitRenderer.scopeTag)("ui5-li-suggestion-item", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-li-suggestion-item wrapping-type="Normal" image="${(0, _LitRenderer.ifDefined)(item.image)}" icon="${(0, _LitRenderer.ifDefined)(item.icon)}" additional-text="${(0, _LitRenderer.ifDefined)(item.additionalText)}" type="${(0, _LitRenderer.ifDefined)(item.type)}" additional-text-state="${(0, _LitRenderer.ifDefined)(item.additionalTextState)}" data-ui5-key="${(0, _LitRenderer.ifDefined)(item.key)}">${(0, _LitRenderer.unsafeHTML)(item.text)}${item.description ? block15.call(this, context, tags, suffix, item, index) : undefined}</ui5-li-suggestion-item>`;
  }
  function block15(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<span slot="richDescription">${(0, _LitRenderer.unsafeHTML)(item.description)}</span>`;
  }
  function block16(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="footer" class="ui5-responsive-popover-footer"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" @click="${this._closeRespPopover}">OK</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${this._closeRespPopover}">OK</ui5-button></div>`;
  }
  function block17(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)} skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="${(0, _LitRenderer.ifDefined)(this._valueStatePopoverHorizontalAlign)}"><div slot="header" class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.shouldDisplayDefaultValueStateMessage ? block18.call(this, context, tags, suffix) : block19.call(this, context, tags, suffix)}</div></${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="${(0, _LitRenderer.ifDefined)(this._valueStatePopoverHorizontalAlign)}"><div slot="header" class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}"><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></ui5-icon>${this.shouldDisplayDefaultValueStateMessage ? block18.call(this, context, tags, suffix) : block19.call(this, context, tags, suffix)}</div></ui5-popover>`;
  }
  function block18(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateText)}`;
  }
  function block19(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block20.call(this, context, tags, suffix, item, index))}`;
  }
  function block20(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  var _default = block0;
  _exports.default = _default;
});