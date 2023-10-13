sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)} class="ui5-select-menu" placement-type="Bottom" horizontal-align="Left" @ui5-after-open="${(0, _LitRenderer.ifDefined)(this._onAfterOpen)}" @ui5-after-close="${(0, _LitRenderer.ifDefined)(this._onAfterClose)}" @ui5-before-open="${(0, _LitRenderer.ifDefined)(this._onBeforeOpen)}" hide-arrow _disable-initial-focus style=${(0, _LitRenderer.styleMap)(this.styles.responsivePopover)}>${this._isPhone ? block1.call(this, context, tags, suffix) : undefined}${!this._isPhone ? block6.call(this, context, tags, suffix) : undefined}<${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)} mode="SingleSelect" separators="None" @ui5-item-click="${(0, _LitRenderer.ifDefined)(this._onOptionClick)}"><slot></slot></${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)}></${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-responsive-popover class="ui5-select-menu" placement-type="Bottom" horizontal-align="Left" @ui5-after-open="${(0, _LitRenderer.ifDefined)(this._onAfterOpen)}" @ui5-after-close="${(0, _LitRenderer.ifDefined)(this._onAfterClose)}" @ui5-before-open="${(0, _LitRenderer.ifDefined)(this._onBeforeOpen)}" hide-arrow _disable-initial-focus style=${(0, _LitRenderer.styleMap)(this.styles.responsivePopover)}>${this._isPhone ? block1.call(this, context, tags, suffix) : undefined}${!this._isPhone ? block6.call(this, context, tags, suffix) : undefined}<ui5-list mode="SingleSelect" separators="None" @ui5-item-click="${(0, _LitRenderer.ifDefined)(this._onOptionClick)}"><slot></slot></ui5-list></ui5-responsive-popover>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${(0, _LitRenderer.ifDefined)(this._headerTitleText)}</span><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${this._onCloseBtnClick}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>${this.hasValueState ? block2.call(this, context, tags, suffix) : undefined}</div>` : (0, _LitRenderer.html)`<div slot="header" class="ui5-responsive-popover-header"><div class="row"><span>${(0, _LitRenderer.ifDefined)(this._headerTitleText)}</span><ui5-button class="ui5-responsive-popover-close-btn" icon="decline" design="Transparent" @click="${this._onCloseBtnClick}"></ui5-button></div>${this.hasValueState ? block2.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)} row ui5-select-value-state-dialog-header">${this.hasValueStateSlot ? block3.call(this, context, tags, suffix) : block5.call(this, context, tags, suffix)}</div>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block4.call(this, context, tags, suffix, item, index))}`;
  }
  function block4(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateText)}`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.hasValueState ? block7.call(this, context, tags, suffix) : undefined}`;
  }
  function block7(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style=${(0, _LitRenderer.styleMap)(this.styles.responsivePopoverHeader)}><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${this.hasValueStateSlot ? block8.call(this, context, tags, suffix) : block10.call(this, context, tags, suffix)}</div>` : (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style=${(0, _LitRenderer.styleMap)(this.styles.responsivePopoverHeader)}><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></ui5-icon>${this.hasValueStateSlot ? block8.call(this, context, tags, suffix) : block10.call(this, context, tags, suffix)}</div>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block9.call(this, context, tags, suffix, item, index))}`;
  }
  function block9(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  function block10(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateText)}`;
  }
  var _default = block0;
  _exports.default = _default;
});