sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<li class="ui5-nli-group-root ui5-nli-focusable" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}" @keydown="${this._onkeydown}" role="listitem" tabindex="${(0, _LitRenderer.ifDefined)(this._tabIndex)}" aria-expanded="${(0, _LitRenderer.ifDefined)(this._ariaExpanded)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this.ariaLabelledBy)}"><div class="ui5-nli-group-header"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="navigation-right-arrow" design="Transparent" @click="${this._onBtnToggleClick}" class="ui5-nli-group-toggle-btn" tooltip="${(0, _LitRenderer.ifDefined)(this.toggleBtnAccessibleName)}" aria-label="${(0, _LitRenderer.ifDefined)(this.toggleBtnAccessibleName)}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>${this.hasPriority ? block1.call(this, context, tags, suffix) : undefined}<div id="${(0, _LitRenderer.ifDefined)(this._id)}-title-text" class="ui5-nli-group-title-text" part="title-text">${(0, _LitRenderer.ifDefined)(this.titleText)}</div>${this.showCounter ? block2.call(this, context, tags, suffix) : undefined}<div class="ui5-nli-group-divider"></div>${!this.collapsed ? block3.call(this, context, tags, suffix) : undefined}${this.showClose ? block7.call(this, context, tags, suffix) : undefined}<span id="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.accInvisibleText)}</span></div><${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)} class="ui5-nli-group-items"><slot></slot></${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)}>${this.busy ? block8.call(this, context, tags, suffix) : undefined}</li>` : (0, _LitRenderer.html)`<li class="ui5-nli-group-root ui5-nli-focusable" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}" @keydown="${this._onkeydown}" role="listitem" tabindex="${(0, _LitRenderer.ifDefined)(this._tabIndex)}" aria-expanded="${(0, _LitRenderer.ifDefined)(this._ariaExpanded)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this.ariaLabelledBy)}"><div class="ui5-nli-group-header"><ui5-button icon="navigation-right-arrow" design="Transparent" @click="${this._onBtnToggleClick}" class="ui5-nli-group-toggle-btn" tooltip="${(0, _LitRenderer.ifDefined)(this.toggleBtnAccessibleName)}" aria-label="${(0, _LitRenderer.ifDefined)(this.toggleBtnAccessibleName)}"></ui5-button>${this.hasPriority ? block1.call(this, context, tags, suffix) : undefined}<div id="${(0, _LitRenderer.ifDefined)(this._id)}-title-text" class="ui5-nli-group-title-text" part="title-text">${(0, _LitRenderer.ifDefined)(this.titleText)}</div>${this.showCounter ? block2.call(this, context, tags, suffix) : undefined}<div class="ui5-nli-group-divider"></div>${!this.collapsed ? block3.call(this, context, tags, suffix) : undefined}${this.showClose ? block7.call(this, context, tags, suffix) : undefined}<span id="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.accInvisibleText)}</span></div><ui5-list class="ui5-nli-group-items"><slot></slot></ui5-list>${this.busy ? block8.call(this, context, tags, suffix) : undefined}</li>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-prio-icon ui5-prio-icon--${(0, _LitRenderer.ifDefined)(this.priorityIcon)}" name="${(0, _LitRenderer.ifDefined)(this.priorityIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-prio-icon ui5-prio-icon--${(0, _LitRenderer.ifDefined)(this.priorityIcon)}" name="${(0, _LitRenderer.ifDefined)(this.priorityIcon)}"></ui5-icon>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-nli-group-counter">(${(0, _LitRenderer.ifDefined)(this.itemsCount)})</span>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.showOverflow ? block4.call(this, context, tags, suffix) : block5.call(this, context, tags, suffix)}`;
  }
  function block4(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="overflow" design="Transparent" @click="${this._onBtnOverflowClick}" class="ui5-nli-overflow-btn" tooltip="${(0, _LitRenderer.ifDefined)(this.overflowBtnAccessibleName)}" aria-label="${(0, _LitRenderer.ifDefined)(this.overflowBtnAccessibleName)}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="overflow" design="Transparent" @click="${this._onBtnOverflowClick}" class="ui5-nli-overflow-btn" tooltip="${(0, _LitRenderer.ifDefined)(this.overflowBtnAccessibleName)}" aria-label="${(0, _LitRenderer.ifDefined)(this.overflowBtnAccessibleName)}"></ui5-button>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.standardActions, (item, index) => item._id || index, (item, index) => block6.call(this, context, tags, suffix, item, index))}`;
  }
  function block6(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="${(0, _LitRenderer.ifDefined)(item.icon)}" class="ui5-nli-action" ?disabled="${item.disabled}" design="${(0, _LitRenderer.ifDefined)(item.design)}" @click="${item.press}" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(item.refItemid)}">${(0, _LitRenderer.ifDefined)(item.text)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="${(0, _LitRenderer.ifDefined)(item.icon)}" class="ui5-nli-action" ?disabled="${item.disabled}" design="${(0, _LitRenderer.ifDefined)(item.design)}" @click="${item.press}" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(item.refItemid)}">${(0, _LitRenderer.ifDefined)(item.text)}</ui5-button>`;
  }
  function block7(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="decline" design="Transparent" @click="${this._onBtnCloseClick}" tooltip="${(0, _LitRenderer.ifDefined)(this.closeBtnAccessibleName)}" aria-label="${(0, _LitRenderer.ifDefined)(this.closeBtnAccessibleName)}" close-btn></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="decline" design="Transparent" @click="${this._onBtnCloseClick}" tooltip="${(0, _LitRenderer.ifDefined)(this.closeBtnAccessibleName)}" aria-label="${(0, _LitRenderer.ifDefined)(this.closeBtnAccessibleName)}" close-btn></ui5-button>`;
  }
  function block8(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-busy-indicator", tags, suffix)} delay="${(0, _LitRenderer.ifDefined)(this.busyDelay)}" active size="Medium" class="ui5-nli-busy"></${(0, _LitRenderer.scopeTag)("ui5-busy-indicator", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-busy-indicator delay="${(0, _LitRenderer.ifDefined)(this.busyDelay)}" active size="Medium" class="ui5-nli-busy"></ui5-busy-indicator>`;
  }
  var _default = block0;
  _exports.default = _default;
});