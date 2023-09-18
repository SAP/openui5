sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-panel-root" role="${(0, _LitRenderer.ifDefined)(this.accRole)}" aria-label="${(0, _LitRenderer.ifDefined)(this.effectiveAccessibleName)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this.fixedPanelAriaLabelledbyReference)}">${this.hasHeaderOrHeaderText ? block1.call(this, context, tags, suffix) : undefined}<div class="ui5-panel-content" id="${(0, _LitRenderer.ifDefined)(this._id)}-content" tabindex="-1" style="${(0, _LitRenderer.styleMap)(this.styles.content)}" part="content"><slot></slot></div></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-panel-heading-wrapper${(0, _LitRenderer.classMap)(this.classes.stickyHeaderClass)}" role="${(0, _LitRenderer.ifDefined)(this.headingWrapperRole)}" aria-level="${(0, _LitRenderer.ifDefined)(this.headingWrapperAriaLevel)}"><div @click="${this._headerClick}" @keydown="${this._headerKeyDown}" @keyup="${this._headerKeyUp}" class="ui5-panel-header" tabindex="${(0, _LitRenderer.ifDefined)(this.headerTabIndex)}" role="${(0, _LitRenderer.ifDefined)(this.accInfo.role)}" aria-expanded="${(0, _LitRenderer.ifDefined)(this.accInfo.ariaExpanded)}" aria-controls="${(0, _LitRenderer.ifDefined)(this.accInfo.ariaControls)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this.accInfo.ariaLabelledby)}" part="header">${!this.fixed ? block2.call(this, context, tags, suffix) : undefined}${this._hasHeader ? block5.call(this, context, tags, suffix) : block6.call(this, context, tags, suffix)}</div></div>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-panel-header-button-root">${this._hasHeader ? block3.call(this, context, tags, suffix) : block4.call(this, context, tags, suffix)}</div>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" class="ui5-panel-header-button ui5-panel-header-button-with-icon" @click="${this._toggleButtonClick}" .accessibilityAttributes=${(0, _LitRenderer.ifDefined)(this.accInfo.button.accessibilityAttributes)} tooltip="${(0, _LitRenderer.ifDefined)(this.accInfo.button.title)}" accessible-name="${(0, _LitRenderer.ifDefined)(this.accInfo.button.ariaLabelButton)}"><div class="ui5-panel-header-icon-wrapper"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-panel-header-icon ${(0, _LitRenderer.classMap)(this.classes.headerBtn)}" name="slim-arrow-right"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></div></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button design="Transparent" class="ui5-panel-header-button ui5-panel-header-button-with-icon" @click="${this._toggleButtonClick}" .accessibilityAttributes=${(0, _LitRenderer.ifDefined)(this.accInfo.button.accessibilityAttributes)} tooltip="${(0, _LitRenderer.ifDefined)(this.accInfo.button.title)}" accessible-name="${(0, _LitRenderer.ifDefined)(this.accInfo.button.ariaLabelButton)}"><div class="ui5-panel-header-icon-wrapper"><ui5-icon class="ui5-panel-header-icon ${(0, _LitRenderer.classMap)(this.classes.headerBtn)}" name="slim-arrow-right"></ui5-icon></div></ui5-button>`;
  }
  function block4(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-panel-header-button ui5-panel-header-icon ${(0, _LitRenderer.classMap)(this.classes.headerBtn)}" name="slim-arrow-right" show-tooltip accessible-name="${(0, _LitRenderer.ifDefined)(this.toggleButtonTitle)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-panel-header-button ui5-panel-header-icon ${(0, _LitRenderer.classMap)(this.classes.headerBtn)}" name="slim-arrow-right" show-tooltip accessible-name="${(0, _LitRenderer.ifDefined)(this.toggleButtonTitle)}"></ui5-icon>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="header"></slot>`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}-header-title" class="ui5-panel-header-title">${(0, _LitRenderer.ifDefined)(this.headerText)}</div>`;
  }
  var _default = block0;
  _exports.default = _default;
});