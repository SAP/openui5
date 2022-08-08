sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}--header" class="${(0, _LitRenderer.classMap)(context.classes)}" role="group" aria-roledescription="${(0, _LitRenderer.ifDefined)(context.ariaRoleDescription)}" @click="${context._click}" @keydown="${context._keydown}" @keyup="${context._keyup}"><div class="ui5-card-header-focusable-element" aria-labelledby="${(0, _LitRenderer.ifDefined)(context.ariaLabelledBy)}" role="${(0, _LitRenderer.ifDefined)(context.ariaRoleFocusableElement)}" data-sap-focus-ref tabindex="0">${context.hasAvatar ? block1(context, tags, suffix) : undefined}<div class="ui5-card-header-text"><div class="ui5-card-header-first-line">${context.titleText ? block2(context, tags, suffix) : undefined}${context.status ? block3(context, tags, suffix) : undefined}</div>${context.subtitleText ? block4(context, tags, suffix) : undefined}</div></div>${context.hasAction ? block5(context, tags, suffix) : undefined}</div></div>`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}-avatar" class="ui5-card-header-avatar" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaCardAvatarLabel)}"><slot name="avatar"></slot></div>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}-title" class="ui5-card-header-title" part="title" aria-role="heading" aria-level="3">${(0, _LitRenderer.ifDefined)(context.titleText)}</div>`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-card-header-status"><span id="${(0, _LitRenderer.ifDefined)(context._id)}-status" part="status" dir="auto">${(0, _LitRenderer.ifDefined)(context.status)}</span></div>`;

  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(context._id)}-subtitle" class="ui5-card-header-subtitle" part="subtitle">${(0, _LitRenderer.ifDefined)(context.subtitleText)}</div>`;

  const block5 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-card-header-action" @focusin="${context._actionsFocusin}" @focusout="${context._actionsFocusout}"><slot name="action"></slot></div>`;

  var _default = block0;
  _exports.default = _default;
});