sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`${context._isPhone ? block1(context, tags, suffix) : block7(context, tags, suffix)}`;

  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-dialog", tags, suffix)} accessible-name=${(0, _LitRenderer.ifDefined)(context.accessibleName)} accessible-name-ref=${(0, _LitRenderer.ifDefined)(context.accessibleNameRef)} stretch _disable-initial-focus @ui5-before-open="${(0, _LitRenderer.ifDefined)(context._beforeDialogOpen)}" @ui5-after-open="${(0, _LitRenderer.ifDefined)(context._propagateDialogEvent)}" @ui5-before-close="${(0, _LitRenderer.ifDefined)(context._propagateDialogEvent)}" @ui5-after-close="${(0, _LitRenderer.ifDefined)(context._afterDialogClose)}" exportparts="content, header, footer">${!context._hideHeader ? block2(context, tags, suffix) : undefined}<slot></slot><slot slot="footer" name="footer"></slot></${(0, _LitRenderer.scopeTag)("ui5-dialog", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-dialog accessible-name=${(0, _LitRenderer.ifDefined)(context.accessibleName)} accessible-name-ref=${(0, _LitRenderer.ifDefined)(context.accessibleNameRef)} stretch _disable-initial-focus @ui5-before-open="${(0, _LitRenderer.ifDefined)(context._beforeDialogOpen)}" @ui5-after-open="${(0, _LitRenderer.ifDefined)(context._propagateDialogEvent)}" @ui5-before-close="${(0, _LitRenderer.ifDefined)(context._propagateDialogEvent)}" @ui5-after-close="${(0, _LitRenderer.ifDefined)(context._afterDialogClose)}" exportparts="content, header, footer">${!context._hideHeader ? block2(context, tags, suffix) : undefined}<slot></slot><slot slot="footer" name="footer"></slot></ui5-dialog>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.header.length ? block3(context, tags, suffix) : block4(context, tags, suffix)}`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot slot="header" name="header"></slot>`;

  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(context.classes.header)}" slot="header">${context.headerText ? block5(context, tags, suffix) : undefined}${!context._hideCloseButton ? block6(context, tags, suffix) : undefined}</div>`;

  const block5 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)} level="H2" class="ui5-popup-header-text ui5-responsive-popover-header-text">${(0, _LitRenderer.ifDefined)(context.headerText)}</${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-title level="H2" class="ui5-popup-header-text ui5-responsive-popover-header-text">${(0, _LitRenderer.ifDefined)(context.headerText)}</ui5-title>`;

  const block6 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="decline" design="Transparent" aria-label="${(0, _LitRenderer.ifDefined)(context._closeDialogAriaLabel)}" @click="${context.close}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="decline" design="Transparent" aria-label="${(0, _LitRenderer.ifDefined)(context._closeDialogAriaLabel)}" @click="${context.close}"></ui5-button>`;

  const block7 = (context, tags, suffix) => (0, _LitRenderer.html)`<section style="${(0, _LitRenderer.styleMap)(context.styles.root)}" class="${(0, _LitRenderer.classMap)(context.classes.root)}" role="dialog" aria-modal="${(0, _LitRenderer.ifDefined)(context._ariaModal)}" aria-label="${(0, _LitRenderer.ifDefined)(context._ariaLabel)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(context._ariaLabelledBy)}" @keydown=${context._onkeydown} @focusout=${context._onfocusout} @mouseup=${context._onmouseup} @mousedown=${context._onmousedown}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToLast}></span><span class="ui5-popover-arrow" style="${(0, _LitRenderer.styleMap)(context.styles.arrow)}"></span>${context._displayHeader ? block8(context, tags, suffix) : undefined}<div style="${(0, _LitRenderer.styleMap)(context.styles.content)}" class="${(0, _LitRenderer.classMap)(context.classes.content)}"  @scroll="${context._scroll}" part="content"><slot></slot></div>${context._displayFooter ? block11(context, tags, suffix) : undefined}<span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToFirst}></span></section>`;

  const block8 = (context, tags, suffix) => (0, _LitRenderer.html)`<header class="ui5-popup-header-root" id="ui5-popup-header" part="header">${context.header.length ? block9(context, tags, suffix) : block10(context, tags, suffix)}</header>`;

  const block9 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="header"></slot>`;

  const block10 = (context, tags, suffix) => (0, _LitRenderer.html)`<h2 class="ui5-popup-header-text">${(0, _LitRenderer.ifDefined)(context.headerText)}</h2>`;

  const block11 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.footer.length ? block12(context, tags, suffix) : undefined}`;

  const block12 = (context, tags, suffix) => (0, _LitRenderer.html)`<footer class="ui5-popup-footer-root" part="footer"><slot name="footer"></slot></footer>`;

  var _default = block0;
  _exports.default = _default;
});