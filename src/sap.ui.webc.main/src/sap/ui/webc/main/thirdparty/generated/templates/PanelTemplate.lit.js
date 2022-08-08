sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-panel-root" role="${(0, _LitRenderer.ifDefined)(context.accRole)}" aria-label="${(0, _LitRenderer.ifDefined)(context.effectiveAccessibleName)}"><div @click="${context._headerClick}" @keydown="${context._headerKeyDown}" @keyup="${context._headerKeyUp}" class="ui5-panel-header" tabindex="${(0, _LitRenderer.ifDefined)(context.headerTabIndex)}" role="${(0, _LitRenderer.ifDefined)(context.accInfo.role)}" aria-expanded="${(0, _LitRenderer.ifDefined)(context.accInfo.ariaExpanded)}" aria-controls="${(0, _LitRenderer.ifDefined)(context.accInfo.ariaControls)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(context.accInfo.ariaLabelledby)}" part="header">${!context.fixed ? block1(context, tags, suffix) : undefined}${context._hasHeader ? block4(context, tags, suffix) : block5(context, tags, suffix)}</div><div class="ui5-panel-content" id="${(0, _LitRenderer.ifDefined)(context._id)}-content" tabindex="-1" style="${(0, _LitRenderer.styleMap)(context.styles.content)}" part="content"><slot></slot></div></div>`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-panel-header-button-root">${context._hasHeader ? block2(context, tags, suffix) : block3(context, tags, suffix)}</div>`;

  const block2 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" class="ui5-panel-header-button ui5-panel-header-button-with-icon" @click="${context._toggleButtonClick}" .accessibilityAttributes=${(0, _LitRenderer.ifDefined)(context.accInfo.button.accessibilityAttributes)} tooltip="${(0, _LitRenderer.ifDefined)(context.accInfo.button.title)}" accessible-name="${(0, _LitRenderer.ifDefined)(context.accInfo.button.ariaLabelButton)}"><div class="ui5-panel-header-icon-wrapper"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-panel-header-icon ${(0, _LitRenderer.classMap)(context.classes.headerBtn)}" name="slim-arrow-right"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></div></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button design="Transparent" class="ui5-panel-header-button ui5-panel-header-button-with-icon" @click="${context._toggleButtonClick}" .accessibilityAttributes=${(0, _LitRenderer.ifDefined)(context.accInfo.button.accessibilityAttributes)} tooltip="${(0, _LitRenderer.ifDefined)(context.accInfo.button.title)}" accessible-name="${(0, _LitRenderer.ifDefined)(context.accInfo.button.ariaLabelButton)}"><div class="ui5-panel-header-icon-wrapper"><ui5-icon class="ui5-panel-header-icon ${(0, _LitRenderer.classMap)(context.classes.headerBtn)}" name="slim-arrow-right"></ui5-icon></div></ui5-button>`;

  const block3 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-panel-header-button ui5-panel-header-icon ${(0, _LitRenderer.classMap)(context.classes.headerBtn)}" name="slim-arrow-right"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-panel-header-button ui5-panel-header-icon ${(0, _LitRenderer.classMap)(context.classes.headerBtn)}" name="slim-arrow-right"></ui5-icon>`;

  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="header"></slot>`;

  const block5 = (context, tags, suffix) => (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}-header-title" role="heading" aria-level="${(0, _LitRenderer.ifDefined)(context.headerAriaLevel)}" class="ui5-panel-header-title">${(0, _LitRenderer.ifDefined)(context.headerText)}</div>`;

  var _default = block0;
  _exports.default = _default;
});