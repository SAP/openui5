sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div><li part="native-li" data-sap-focus-ref tabindex="${(0, _LitRenderer.ifDefined)(this._effectiveTabIndex)}" class="${(0, _LitRenderer.classMap)(this.classes.main)}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}" @keyup="${this._onkeyup}" @keydown="${this._onkeydown}" @mouseup="${this._onmouseup}" @mousedown="${this._onmousedown}" @touchstart="${this._ontouchstart}" @touchend="${this._ontouchend}" @click="${this._onclick}" role="${(0, _LitRenderer.ifDefined)(this._accInfo.role)}" aria-expanded="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaExpanded)}" title="${(0, _LitRenderer.ifDefined)(this.title)}" aria-level="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLevel)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaHaspopup)}" aria-posinset="${(0, _LitRenderer.ifDefined)(this._accInfo.posinset)}" aria-roledescription="${(0, _LitRenderer.ifDefined)(this.accessibleRoleDescription)}" aria-setsize="${(0, _LitRenderer.ifDefined)(this._accInfo.setsize)}" aria-describedby="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText-describedby" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._accessibleNameRef)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this._ariaDisabled)}" aria-selected="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaSelected)}" aria-checked="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaChecked)}" aria-owns="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaOwns)}"><div class="ui5-li-tree-toggle-box" style="${(0, _LitRenderer.styleMap)(this.styles.preContent)}">${this._showToggleButtonBeginning ? block1.call(this, context, tags, suffix) : undefined}</div>${this.placeSelectionElementBefore ? block2.call(this, context, tags, suffix) : undefined}<div part="content" id="${(0, _LitRenderer.ifDefined)(this._id)}-content" class="ui5-li-content">${this.icon ? block8.call(this, context, tags, suffix) : undefined}</div>${this._showToggleButtonEnd ? block9.call(this, context, tags, suffix) : undefined}${this.typeDetail ? block10.call(this, context, tags, suffix) : undefined}${this.typeNavigation ? block11.call(this, context, tags, suffix) : undefined}${this.navigated ? block12.call(this, context, tags, suffix) : undefined}${this.placeSelectionElementAfter ? block13.call(this, context, tags, suffix) : undefined}<span id="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this._accInfo.listItemAriaLabel)}${(0, _LitRenderer.ifDefined)(this.accessibleName)}</span><span id="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText-describedby" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this._accInfo.ariaSelectedText)}</span></li>${this.expanded ? block19.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} part="toggle-icon" class="ui5-li-tree-toggle-icon" name="${(0, _LitRenderer.ifDefined)(this._toggleIconName)}" show-tooltip accessible-name="${(0, _LitRenderer.ifDefined)(this.iconAccessibleName)}" @click="${this._toggleClick}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon part="toggle-icon" class="ui5-li-tree-toggle-icon" name="${(0, _LitRenderer.ifDefined)(this._toggleIconName)}" show-tooltip accessible-name="${(0, _LitRenderer.ifDefined)(this.iconAccessibleName)}" @click="${this._toggleClick}"></ui5-icon>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.modeSingleSelect ? block3.call(this, context, tags, suffix) : undefined}${this.modeMultiSelect ? block4.call(this, context, tags, suffix) : undefined}${this.renderDeleteButton ? block5.call(this, context, tags, suffix) : undefined}`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-radio-button", tags, suffix)} part="radio" ?disabled="${this.isInactive}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabelRadioButton)}" tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-singleSelectionElement" class="ui5-li-singlesel-radiobtn" ?checked="${this.selected}" @click="${this.onSingleSelectionComponentPress}"></${(0, _LitRenderer.scopeTag)("ui5-radio-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-radio-button part="radio" ?disabled="${this.isInactive}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabelRadioButton)}" tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-singleSelectionElement" class="ui5-li-singlesel-radiobtn" ?checked="${this.selected}" @click="${this.onSingleSelectionComponentPress}"></ui5-radio-button>`;
  }
  function block4(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)} part="checkbox" ?disabled="${this.isInactive}" ?indeterminate=${this.indeterminate} tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-multiSelectionElement" class="ui5-li-multisel-cb" ?checked="${this.selected}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabel)}" @click="${this.onMultiSelectionComponentPress}"></${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-checkbox part="checkbox" ?disabled="${this.isInactive}" ?indeterminate=${this.indeterminate} tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-multiSelectionElement" class="ui5-li-multisel-cb" ?checked="${this.selected}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabel)}" @click="${this.onMultiSelectionComponentPress}"></ui5-checkbox>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-li-deletebtn">${this.hasDeleteButtonSlot ? block6.call(this, context, tags, suffix) : block7.call(this, context, tags, suffix)}</div>`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="deleteButton"></slot>`;
  }
  function block7(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} part="delete-button" tabindex="-1" data-sap-no-tab-ref id="${(0, _LitRenderer.ifDefined)(this._id)}-deleteSelectionElement" design="Transparent" icon="decline" ?disabled="${this.disableDeleteButton}" @click="${this.onDelete}" tooltip="${(0, _LitRenderer.ifDefined)(this.deleteText)}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button part="delete-button" tabindex="-1" data-sap-no-tab-ref id="${(0, _LitRenderer.ifDefined)(this._id)}-deleteSelectionElement" design="Transparent" icon="decline" ?disabled="${this.disableDeleteButton}" @click="${this.onDelete}" tooltip="${(0, _LitRenderer.ifDefined)(this.deleteText)}"></ui5-button>`;
  }
  function block8(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} part="icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}" class="ui5-li-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon part="icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}" class="ui5-li-icon"></ui5-icon>`;
  }
  function block9(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} part="toggle-icon" class="ui5-li-tree-toggle-icon" name="${(0, _LitRenderer.ifDefined)(this._toggleIconName)}" @click="${this._toggleClick}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon part="toggle-icon" class="ui5-li-tree-toggle-icon" name="${(0, _LitRenderer.ifDefined)(this._toggleIconName)}" @click="${this._toggleClick}"></ui5-icon>`;
  }
  function block10(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-li-detailbtn"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} part="detail-button" design="Transparent" icon="edit" @click="${this.onDetailClick}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="ui5-li-detailbtn"><ui5-button part="detail-button" design="Transparent" icon="edit" @click="${this.onDetailClick}"></ui5-button></div>`;
  }
  function block11(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name ="slim-arrow-right"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name ="slim-arrow-right"></ui5-icon>`;
  }
  function block12(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-li-navigated"></div>`;
  }
  function block13(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.modeSingleSelect ? block14.call(this, context, tags, suffix) : undefined}${this.modeMultiSelect ? block15.call(this, context, tags, suffix) : undefined}${this.renderDeleteButton ? block16.call(this, context, tags, suffix) : undefined}`;
  }
  function block14(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-radio-button", tags, suffix)} part="radio" ?disabled="${this.isInactive}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabelRadioButton)}" tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-singleSelectionElement" class="ui5-li-singlesel-radiobtn" ?checked="${this.selected}" @click="${this.onSingleSelectionComponentPress}"></${(0, _LitRenderer.scopeTag)("ui5-radio-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-radio-button part="radio" ?disabled="${this.isInactive}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabelRadioButton)}" tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-singleSelectionElement" class="ui5-li-singlesel-radiobtn" ?checked="${this.selected}" @click="${this.onSingleSelectionComponentPress}"></ui5-radio-button>`;
  }
  function block15(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)} part="checkbox" ?disabled="${this.isInactive}" ?indeterminate=${this.indeterminate} tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-multiSelectionElement" class="ui5-li-multisel-cb" ?checked="${this.selected}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabel)}" @click="${this.onMultiSelectionComponentPress}"></${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-checkbox part="checkbox" ?disabled="${this.isInactive}" ?indeterminate=${this.indeterminate} tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-multiSelectionElement" class="ui5-li-multisel-cb" ?checked="${this.selected}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabel)}" @click="${this.onMultiSelectionComponentPress}"></ui5-checkbox>`;
  }
  function block16(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-li-deletebtn">${this.hasDeleteButtonSlot ? block17.call(this, context, tags, suffix) : block18.call(this, context, tags, suffix)}</div>`;
  }
  function block17(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="deleteButton"></slot>`;
  }
  function block18(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} part="delete-button" tabindex="-1" data-sap-no-tab-ref id="${(0, _LitRenderer.ifDefined)(this._id)}-deleteSelectionElement" design="Transparent" icon="decline" ?disabled="${this.disableDeleteButton}" @click="${this.onDelete}" tooltip="${(0, _LitRenderer.ifDefined)(this.deleteText)}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button part="delete-button" tabindex="-1" data-sap-no-tab-ref id="${(0, _LitRenderer.ifDefined)(this._id)}-deleteSelectionElement" design="Transparent" icon="decline" ?disabled="${this.disableDeleteButton}" @click="${this.onDelete}" tooltip="${(0, _LitRenderer.ifDefined)(this.deleteText)}"></ui5-button>`;
  }
  function block19(context, tags, suffix) {
    return (0, _LitRenderer.html)`<ul role="group" id="${(0, _LitRenderer.ifDefined)(this._id)}-subtree" class="ui5-tree-li-subtree"><slot></slot></ul>`;
  }
  var _default = block0;
  _exports.default = _default;
});