sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.options ? block1.call(this, context, tags, suffix) : undefined}${this.shouldOpenValueStateMessagePopover ? block13.call(this, context, tags, suffix) : undefined}`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)} hide-arrow _disable-initial-focus placement-type="Bottom" class="ui5-select-popover ${(0, _LitRenderer.classMap)(this.classes.popover)}" horizontal-align="Left" @ui5-after-open="${(0, _LitRenderer.ifDefined)(this._afterOpen)}" @ui5-before-open="${(0, _LitRenderer.ifDefined)(this._beforeOpen)}" @ui5-after-close="${(0, _LitRenderer.ifDefined)(this._afterClose)}" @keydown="${this._onkeydown}" style=${(0, _LitRenderer.styleMap)(this.styles.responsivePopover)}>${this._isPhone ? block2.call(this, context, tags, suffix) : undefined}${!this._isPhone ? block7.call(this, context, tags, suffix) : undefined}<${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)} mode="SingleSelectAuto" separators="None" @mousedown="${this._itemMousedown}" @ui5-item-click="${(0, _LitRenderer.ifDefined)(this._handleItemPress)}">${(0, _LitRenderer.repeat)(this._syncedOptions, (item, index) => item._id || index, (item, index) => block12.call(this, context, tags, suffix, item, index))}</${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)}></${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-responsive-popover hide-arrow _disable-initial-focus placement-type="Bottom" class="ui5-select-popover ${(0, _LitRenderer.classMap)(this.classes.popover)}" horizontal-align="Left" @ui5-after-open="${(0, _LitRenderer.ifDefined)(this._afterOpen)}" @ui5-before-open="${(0, _LitRenderer.ifDefined)(this._beforeOpen)}" @ui5-after-close="${(0, _LitRenderer.ifDefined)(this._afterClose)}" @keydown="${this._onkeydown}" style=${(0, _LitRenderer.styleMap)(this.styles.responsivePopover)}>${this._isPhone ? block2.call(this, context, tags, suffix) : undefined}${!this._isPhone ? block7.call(this, context, tags, suffix) : undefined}<ui5-list mode="SingleSelectAuto" separators="None" @mousedown="${this._itemMousedown}" @ui5-item-click="${(0, _LitRenderer.ifDefined)(this._handleItemPress)}">${(0, _LitRenderer.repeat)(this._syncedOptions, (item, index) => item._id || index, (item, index) => block12.call(this, context, tags, suffix, item, index))}</ui5-list></ui5-responsive-popover>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${(0, _LitRenderer.ifDefined)(this._headerTitleText)}</span><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${this._toggleRespPopover}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>${this.hasValueStateText ? block3.call(this, context, tags, suffix) : undefined}</div>` : (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${(0, _LitRenderer.ifDefined)(this._headerTitleText)}</span><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${this._toggleRespPopover}"></ui5-button></div>${this.hasValueStateText ? block3.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)} row ui5-select-value-state-dialog-header">${this.shouldDisplayDefaultValueStateMessage ? block4.call(this, context, tags, suffix) : block5.call(this, context, tags, suffix)}</div>`;
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
    return (0, _LitRenderer.html)`${this.hasValueStateText ? block8.call(this, context, tags, suffix) : undefined}`;
  }
  function block8(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style=${(0, _LitRenderer.styleMap)(this.styles.responsivePopoverHeader)}><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.shouldDisplayDefaultValueStateMessage ? block9.call(this, context, tags, suffix) : block10.call(this, context, tags, suffix)}</div>` : (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style=${(0, _LitRenderer.styleMap)(this.styles.responsivePopoverHeader)}><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></ui5-icon>${this.shouldDisplayDefaultValueStateMessage ? block9.call(this, context, tags, suffix) : block10.call(this, context, tags, suffix)}</div>`;
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
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-li", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(item.id)}-li" icon="${(0, _LitRenderer.ifDefined)(item.icon)}" ?selected="${item.selected}" ?focused="${item._focused}" title="${(0, _LitRenderer.ifDefined)(item.title)}" additional-text="${(0, _LitRenderer.ifDefined)(item.additionalText)}" ?aria-selected="${item.selected}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}">${(0, _LitRenderer.ifDefined)(item.textContent)}</${(0, _LitRenderer.scopeTag)("ui5-li", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-li id="${(0, _LitRenderer.ifDefined)(item.id)}-li" icon="${(0, _LitRenderer.ifDefined)(item.icon)}" ?selected="${item.selected}" ?focused="${item._focused}" title="${(0, _LitRenderer.ifDefined)(item.title)}" additional-text="${(0, _LitRenderer.ifDefined)(item.additionalText)}" ?aria-selected="${item.selected}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}">${(0, _LitRenderer.ifDefined)(item.textContent)}</ui5-li>`;
  }
  function block13(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)} skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="Left"><div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.shouldDisplayDefaultValueStateMessage ? block14.call(this, context, tags, suffix) : block15.call(this, context, tags, suffix)}</div></${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="Left"><div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}"><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></ui5-icon>${this.shouldDisplayDefaultValueStateMessage ? block14.call(this, context, tags, suffix) : block15.call(this, context, tags, suffix)}</div></ui5-popover>`;
  }
  function block14(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateText)}`;
  }
  function block15(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block16.call(this, context, tags, suffix, item, index))}`;
  }
  function block16(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  var _default = block0;
  _exports.default = _default;
});