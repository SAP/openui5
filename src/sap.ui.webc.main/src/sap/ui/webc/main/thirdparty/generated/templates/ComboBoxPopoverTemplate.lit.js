sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)} class="${(0, _LitRenderer.classMap)(this.classes.popover)}" hide-arrow _disable-initial-focus placement-type="Bottom" horizontal-align="Left" style="${(0, _LitRenderer.styleMap)(this.styles.suggestionsPopover)}" @ui5-after-open=${(0, _LitRenderer.ifDefined)(this._afterOpenPopover)} @ui5-after-close=${(0, _LitRenderer.ifDefined)(this._afterClosePopover)}><${(0, _LitRenderer.scopeTag)("ui5-busy-indicator", tags, suffix)} ?active=${this.loading} size="Medium" class="ui5-combobox-busy"></${(0, _LitRenderer.scopeTag)("ui5-busy-indicator", tags, suffix)}>${this._isPhone ? block1.call(this, context, tags, suffix) : undefined}${!this._isPhone ? block6.call(this, context, tags, suffix) : undefined}<${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)} separators="None" @ui5-item-click=${(0, _LitRenderer.ifDefined)(this._selectItem)} @ui5-item-focused=${(0, _LitRenderer.ifDefined)(this._onItemFocus)} @mousedown=${this._itemMousedown} mode="SingleSelect">${(0, _LitRenderer.repeat)(this._filteredItems, (item, index) => item._id || index, (item, index) => block11.call(this, context, tags, suffix, item, index))}</${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)}>${this._isPhone ? block14.call(this, context, tags, suffix) : undefined}</${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)}>${this.shouldOpenValueStateMessagePopover ? block15.call(this, context, tags, suffix) : undefined} ` : (0, _LitRenderer.html)`<ui5-responsive-popover class="${(0, _LitRenderer.classMap)(this.classes.popover)}" hide-arrow _disable-initial-focus placement-type="Bottom" horizontal-align="Left" style="${(0, _LitRenderer.styleMap)(this.styles.suggestionsPopover)}" @ui5-after-open=${(0, _LitRenderer.ifDefined)(this._afterOpenPopover)} @ui5-after-close=${(0, _LitRenderer.ifDefined)(this._afterClosePopover)}><ui5-busy-indicator ?active=${this.loading} size="Medium" class="ui5-combobox-busy"></ui5-busy-indicator>${this._isPhone ? block1.call(this, context, tags, suffix) : undefined}${!this._isPhone ? block6.call(this, context, tags, suffix) : undefined}<ui5-list separators="None" @ui5-item-click=${(0, _LitRenderer.ifDefined)(this._selectItem)} @ui5-item-focused=${(0, _LitRenderer.ifDefined)(this._onItemFocus)} @mousedown=${this._itemMousedown} mode="SingleSelect">${(0, _LitRenderer.repeat)(this._filteredItems, (item, index) => item._id || index, (item, index) => block11.call(this, context, tags, suffix, item, index))}</ui5-list>${this._isPhone ? block14.call(this, context, tags, suffix) : undefined}</ui5-responsive-popover>${this.shouldOpenValueStateMessagePopover ? block15.call(this, context, tags, suffix) : undefined} `;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${(0, _LitRenderer.ifDefined)(this._headerTitleText)}</span><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${this._closeRespPopover}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div><div class="row"><div class="input-root-phone" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}"><input class="ui5-input-inner-phone" .value="${(0, _LitRenderer.ifDefined)(this.value)}" inner-input placeholder="${(0, _LitRenderer.ifDefined)(this.placeholder)}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" @input="${this._input}" @change="${this._inputChange}" @keydown="${this._keydown}" aria-autocomplete="both" /></div></div>${this.hasValueStateText ? block2.call(this, context, tags, suffix) : undefined}</div>` : (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${(0, _LitRenderer.ifDefined)(this._headerTitleText)}</span><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${this._closeRespPopover}"></ui5-button></div><div class="row"><div class="input-root-phone" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}"><input class="ui5-input-inner-phone" .value="${(0, _LitRenderer.ifDefined)(this.value)}" inner-input placeholder="${(0, _LitRenderer.ifDefined)(this.placeholder)}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" @input="${this._input}" @change="${this._inputChange}" @keydown="${this._keydown}" aria-autocomplete="both" /></div></div>${this.hasValueStateText ? block2.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverValueStateMessage)}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.shouldDisplayDefaultValueStateMessage ? block3.call(this, context, tags, suffix) : block4.call(this, context, tags, suffix)}</div>` : (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverValueStateMessage)}"><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageIcon)}"></ui5-icon>${this.shouldDisplayDefaultValueStateMessage ? block3.call(this, context, tags, suffix) : block4.call(this, context, tags, suffix)}</div>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateDefaultText)}`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block5.call(this, context, tags, suffix, item, index))}`;
  }
  function block5(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.hasValueStateText ? block7.call(this, context, tags, suffix) : undefined}`;
  }
  function block7(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header ${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" ?focused=${this._isValueStateFocused} tabindex="0" style="${(0, _LitRenderer.styleMap)(this.styles.suggestionPopoverHeader)}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.shouldDisplayDefaultValueStateMessage ? block8.call(this, context, tags, suffix) : block9.call(this, context, tags, suffix)}</div>` : (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header ${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" ?focused=${this._isValueStateFocused} tabindex="0" style="${(0, _LitRenderer.styleMap)(this.styles.suggestionPopoverHeader)}"><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageIcon)}"></ui5-icon>${this.shouldDisplayDefaultValueStateMessage ? block8.call(this, context, tags, suffix) : block9.call(this, context, tags, suffix)}</div>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateDefaultText)}`;
  }
  function block9(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block10.call(this, context, tags, suffix, item, index))}`;
  }
  function block10(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  function block11(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${item.isGroupItem ? block12.call(this, context, tags, suffix, item, index) : block13.call(this, context, tags, suffix, item, index)}`;
  }
  function block12(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-li-groupheader", tags, suffix)} ?focused=${item.focused}>${(0, _LitRenderer.ifDefined)(item.text)}</${(0, _LitRenderer.scopeTag)("ui5-li-groupheader", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-li-groupheader ?focused=${item.focused}>${(0, _LitRenderer.ifDefined)(item.text)}</ui5-li-groupheader>`;
  }
  function block13(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-li", tags, suffix)} type="Active" wrapping-type="Normal" additional-text=${(0, _LitRenderer.ifDefined)(item.additionalText)} group-name=${(0, _LitRenderer.ifDefined)(item.groupName)} ._tabIndex=${(0, _LitRenderer.ifDefined)(item.itemTabIndex)} .mappedItem=${(0, _LitRenderer.ifDefined)(item)} ?selected=${item.selected} ?focused=${item.focused}>${(0, _LitRenderer.ifDefined)(item.text)}</${(0, _LitRenderer.scopeTag)("ui5-li", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-li type="Active" wrapping-type="Normal" additional-text=${(0, _LitRenderer.ifDefined)(item.additionalText)} group-name=${(0, _LitRenderer.ifDefined)(item.groupName)} ._tabIndex=${(0, _LitRenderer.ifDefined)(item.itemTabIndex)} .mappedItem=${(0, _LitRenderer.ifDefined)(item)} ?selected=${item.selected} ?focused=${item.focused}>${(0, _LitRenderer.ifDefined)(item.text)}</ui5-li>`;
  }
  function block14(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="footer" class="ui5-responsive-popover-footer"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" @click="${this._closeRespPopover}">OK</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${this._closeRespPopover}">OK</ui5-button></div>`;
  }
  function block15(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)} skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" horizontal-align="${(0, _LitRenderer.ifDefined)(this._valueStatePopoverHorizontalAlign)}" placement-type="Bottom"><div slot="header" class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.shouldDisplayDefaultValueStateMessage ? block16.call(this, context, tags, suffix) : block17.call(this, context, tags, suffix)}</div></${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" horizontal-align="${(0, _LitRenderer.ifDefined)(this._valueStatePopoverHorizontalAlign)}" placement-type="Bottom"><div slot="header" class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}"><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageIcon)}"></ui5-icon>${this.shouldDisplayDefaultValueStateMessage ? block16.call(this, context, tags, suffix) : block17.call(this, context, tags, suffix)}</div></ui5-popover>`;
  }
  function block16(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateDefaultText)}`;
  }
  function block17(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block18.call(this, context, tags, suffix, item, index))}`;
  }
  function block18(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  var _default = block0;
  _exports.default = _default;
});