sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)} placement-type="Bottom" horizontal-align="Left" class="${(0, _LitRenderer.classMap)(this.classes.popover)}" hide-arrow _disable-initial-focus style="${(0, _LitRenderer.styleMap)(this.styles.suggestionsPopover)}" @ui5-selection-change=${(0, _LitRenderer.ifDefined)(this._listSelectionChange)} @ui5-after-close=${(0, _LitRenderer.ifDefined)(this._afterClosePicker)} @ui5-before-open=${(0, _LitRenderer.ifDefined)(this._beforeOpen)} @ui5-after-open=${(0, _LitRenderer.ifDefined)(this._afterOpenPicker)}>${this._isPhone ? block1.call(this, context, tags, suffix) : undefined}${!this._isPhone ? block6.call(this, context, tags, suffix) : undefined}${this.filterSelected ? block11.call(this, context, tags, suffix) : block15.call(this, context, tags, suffix)}${this._isPhone ? block19.call(this, context, tags, suffix) : undefined}</${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)}>${this.hasValueStateMessage ? block20.call(this, context, tags, suffix) : undefined} ` : (0, _LitRenderer.html)`<ui5-responsive-popover placement-type="Bottom" horizontal-align="Left" class="${(0, _LitRenderer.classMap)(this.classes.popover)}" hide-arrow _disable-initial-focus style="${(0, _LitRenderer.styleMap)(this.styles.suggestionsPopover)}" @ui5-selection-change=${(0, _LitRenderer.ifDefined)(this._listSelectionChange)} @ui5-after-close=${(0, _LitRenderer.ifDefined)(this._afterClosePicker)} @ui5-before-open=${(0, _LitRenderer.ifDefined)(this._beforeOpen)} @ui5-after-open=${(0, _LitRenderer.ifDefined)(this._afterOpenPicker)}>${this._isPhone ? block1.call(this, context, tags, suffix) : undefined}${!this._isPhone ? block6.call(this, context, tags, suffix) : undefined}${this.filterSelected ? block11.call(this, context, tags, suffix) : block15.call(this, context, tags, suffix)}${this._isPhone ? block19.call(this, context, tags, suffix) : undefined}</ui5-responsive-popover>${this.hasValueStateMessage ? block20.call(this, context, tags, suffix) : undefined} `;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}"><div class="row"><span>${(0, _LitRenderer.ifDefined)(this._headerTitleText)}</span><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${this.handleCancel}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div><div class="row"><div slot="header" class="input-root-phone" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}"><input .value="${(0, _LitRenderer.ifDefined)(this.value)}" inner-input placeholder="${(0, _LitRenderer.ifDefined)(this.placeholder)}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" @input="${this._inputLiveChange}" @change=${this._inputChange} @keydown=${this._onkeydown} aria-autocomplete="both" /></div><${(0, _LitRenderer.scopeTag)("ui5-toggle-button", tags, suffix)} slot="header" class="ui5-multi-combobox-toggle-button" icon="multiselect-all" design="Transparent" ?pressed=${this._showAllItemsButtonPressed} @click="${this.filterSelectedItems}"></${(0, _LitRenderer.scopeTag)("ui5-toggle-button", tags, suffix)}></div>${this.hasValueStateMessage ? block2.call(this, context, tags, suffix) : undefined}</div></div>` : (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}"><div class="row"><span>${(0, _LitRenderer.ifDefined)(this._headerTitleText)}</span><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${this.handleCancel}"></ui5-button></div><div class="row"><div slot="header" class="input-root-phone" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}"><input .value="${(0, _LitRenderer.ifDefined)(this.value)}" inner-input placeholder="${(0, _LitRenderer.ifDefined)(this.placeholder)}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" @input="${this._inputLiveChange}" @change=${this._inputChange} @keydown=${this._onkeydown} aria-autocomplete="both" /></div><ui5-toggle-button slot="header" class="ui5-multi-combobox-toggle-button" icon="multiselect-all" design="Transparent" ?pressed=${this._showAllItemsButtonPressed} @click="${this.filterSelectedItems}"></ui5-toggle-button></div>${this.hasValueStateMessage ? block2.call(this, context, tags, suffix) : undefined}</div></div>`;
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
    return (0, _LitRenderer.html)`${this.hasValueStateMessage ? block7.call(this, context, tags, suffix) : undefined}`;
  }
  function block7(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="header" @keydown="${this._onValueStateKeydown}" tabindex="0" class="ui5-responsive-popover-header ${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style=${(0, _LitRenderer.styleMap)(this.styles.popoverValueStateMessage)}><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.shouldDisplayDefaultValueStateMessage ? block8.call(this, context, tags, suffix) : block9.call(this, context, tags, suffix)}</div>` : (0, _LitRenderer.html)`<div slot="header" @keydown="${this._onValueStateKeydown}" tabindex="0" class="ui5-responsive-popover-header ${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style=${(0, _LitRenderer.styleMap)(this.styles.popoverValueStateMessage)}><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageIcon)}"></ui5-icon>${this.shouldDisplayDefaultValueStateMessage ? block8.call(this, context, tags, suffix) : block9.call(this, context, tags, suffix)}</div>`;
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
  function block11(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)} separators="None" mode="MultiSelect" class="ui5-multi-combobox-all-items-list">${(0, _LitRenderer.repeat)(this.selectedItems, (item, index) => item._id || index, (item, index) => block12.call(this, context, tags, suffix, item, index))}</${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-list separators="None" mode="MultiSelect" class="ui5-multi-combobox-all-items-list">${(0, _LitRenderer.repeat)(this.selectedItems, (item, index) => item._id || index, (item, index) => block12.call(this, context, tags, suffix, item, index))}</ui5-list>`;
  }
  function block12(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${item.isGroupItem ? block13.call(this, context, tags, suffix, item, index) : block14.call(this, context, tags, suffix, item, index)}`;
  }
  function block13(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-li-groupheader", tags, suffix)} data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}" @keydown="${this._onItemKeydown}">${(0, _LitRenderer.ifDefined)(item.text)}</${(0, _LitRenderer.scopeTag)("ui5-li-groupheader", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-li-groupheader data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}" @keydown="${this._onItemKeydown}">${(0, _LitRenderer.ifDefined)(item.text)}</ui5-li-groupheader>`;
  }
  function block14(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-li", tags, suffix)} wrapping-type="Normal" type="${(0, _LitRenderer.ifDefined)(this._listItemsType)}" additional-text=${(0, _LitRenderer.ifDefined)(item.additionalText)} ?selected=${item.selected} data-ui5-token-id="${(0, _LitRenderer.ifDefined)(item._id)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}" @keydown="${this._onItemKeydown}">${(0, _LitRenderer.ifDefined)(item.text)}</${(0, _LitRenderer.scopeTag)("ui5-li", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-li wrapping-type="Normal" type="${(0, _LitRenderer.ifDefined)(this._listItemsType)}" additional-text=${(0, _LitRenderer.ifDefined)(item.additionalText)} ?selected=${item.selected} data-ui5-token-id="${(0, _LitRenderer.ifDefined)(item._id)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}" @keydown="${this._onItemKeydown}">${(0, _LitRenderer.ifDefined)(item.text)}</ui5-li>`;
  }
  function block15(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)} separators="None" mode="MultiSelect" class="ui5-multi-combobox-all-items-list">${(0, _LitRenderer.repeat)(this._filteredItems, (item, index) => item._id || index, (item, index) => block16.call(this, context, tags, suffix, item, index))}</${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-list separators="None" mode="MultiSelect" class="ui5-multi-combobox-all-items-list">${(0, _LitRenderer.repeat)(this._filteredItems, (item, index) => item._id || index, (item, index) => block16.call(this, context, tags, suffix, item, index))}</ui5-list>`;
  }
  function block16(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${item.isGroupItem ? block17.call(this, context, tags, suffix, item, index) : block18.call(this, context, tags, suffix, item, index)}`;
  }
  function block17(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-li-groupheader", tags, suffix)} data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}" @keydown="${this._onItemKeydown}">${(0, _LitRenderer.ifDefined)(item.text)}</${(0, _LitRenderer.scopeTag)("ui5-li-groupheader", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-li-groupheader data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}" @keydown="${this._onItemKeydown}">${(0, _LitRenderer.ifDefined)(item.text)}</ui5-li-groupheader>`;
  }
  function block18(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-li", tags, suffix)} wrapping-type="Normal" type="${(0, _LitRenderer.ifDefined)(this._listItemsType)}" additional-text=${(0, _LitRenderer.ifDefined)(item.additionalText)} ?selected=${item.selected} data-ui5-token-id="${(0, _LitRenderer.ifDefined)(item._id)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}" @keydown="${this._onItemKeydown}">${(0, _LitRenderer.ifDefined)(item.text)}</${(0, _LitRenderer.scopeTag)("ui5-li", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-li wrapping-type="Normal" type="${(0, _LitRenderer.ifDefined)(this._listItemsType)}" additional-text=${(0, _LitRenderer.ifDefined)(item.additionalText)} ?selected=${item.selected} data-ui5-token-id="${(0, _LitRenderer.ifDefined)(item._id)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}" @keydown="${this._onItemKeydown}">${(0, _LitRenderer.ifDefined)(item.text)}</ui5-li>`;
  }
  function block19(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="footer" class="ui5-responsive-popover-footer"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" @click="${this.handleOK}">${(0, _LitRenderer.ifDefined)(this._dialogOkButton)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${this.handleOK}">${(0, _LitRenderer.ifDefined)(this._dialogOkButton)}</ui5-button></div>`;
  }
  function block20(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)} skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="${(0, _LitRenderer.ifDefined)(this._valueStatePopoverHorizontalAlign)}"><div slot="header" class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.shouldDisplayDefaultValueStateMessage ? block21.call(this, context, tags, suffix) : block22.call(this, context, tags, suffix)}</div></${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="${(0, _LitRenderer.ifDefined)(this._valueStatePopoverHorizontalAlign)}"><div slot="header" class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}"><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageIcon)}"></ui5-icon>${this.shouldDisplayDefaultValueStateMessage ? block21.call(this, context, tags, suffix) : block22.call(this, context, tags, suffix)}</div></ui5-popover>`;
  }
  function block21(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateDefaultText)}`;
  }
  function block22(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block23.call(this, context, tags, suffix, item, index))}`;
  }
  function block23(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  var _default = block0;
  _exports.default = _default;
});