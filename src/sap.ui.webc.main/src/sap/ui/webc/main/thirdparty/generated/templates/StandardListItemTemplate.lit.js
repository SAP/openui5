sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<li part="native-li" data-sap-focus-ref tabindex="${(0, _LitRenderer.ifDefined)(this._effectiveTabIndex)}" class="${(0, _LitRenderer.classMap)(this.classes.main)}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}" @keyup="${this._onkeyup}" @keydown="${this._onkeydown}" @mouseup="${this._onmouseup}" @mousedown="${this._onmousedown}" @touchstart="${this._ontouchstart}" @touchend="${this._ontouchend}" @click="${this._onclick}" role="${(0, _LitRenderer.ifDefined)(this._accInfo.role)}" aria-expanded="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaExpanded)}" title="${(0, _LitRenderer.ifDefined)(this.title)}" aria-level="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLevel)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaHaspopup)}" aria-posinset="${(0, _LitRenderer.ifDefined)(this._accInfo.posinset)}" aria-roledescription="${(0, _LitRenderer.ifDefined)(this.accessibleRoleDescription)}" aria-setsize="${(0, _LitRenderer.ifDefined)(this._accInfo.setsize)}" aria-describedby="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText-describedby" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._accessibleNameRef)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this._ariaDisabled)}" aria-selected="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaSelected)}" aria-checked="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaChecked)}" aria-owns="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaOwns)}">${this.placeSelectionElementBefore ? block1.call(this, context, tags, suffix) : undefined}<div part="content" id="${(0, _LitRenderer.ifDefined)(this._id)}-content" class="ui5-li-content">${this.hasImageContent ? block7.call(this, context, tags, suffix) : block8.call(this, context, tags, suffix)}${this.displayIconBegin ? block10.call(this, context, tags, suffix) : undefined}<div class="ui5-li-text-wrapper"><span part="title" class="ui5-li-title"><slot></slot></span>${this.description ? block11.call(this, context, tags, suffix) : undefined}${!this.typeActive ? block13.call(this, context, tags, suffix) : undefined}</div>${!this.description ? block14.call(this, context, tags, suffix) : undefined}</div>${this.displayIconEnd ? block16.call(this, context, tags, suffix) : undefined}${this.typeDetail ? block17.call(this, context, tags, suffix) : undefined}${this.typeNavigation ? block18.call(this, context, tags, suffix) : undefined}${this.navigated ? block19.call(this, context, tags, suffix) : undefined}${this.placeSelectionElementAfter ? block20.call(this, context, tags, suffix) : undefined}<span id="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this._accInfo.listItemAriaLabel)}${(0, _LitRenderer.ifDefined)(this.accessibleName)}</span><span id="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText-describedby" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this._accInfo.ariaSelectedText)}</span></li> `;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.modeSingleSelect ? block2.call(this, context, tags, suffix) : undefined}${this.modeMultiSelect ? block3.call(this, context, tags, suffix) : undefined}${this.renderDeleteButton ? block4.call(this, context, tags, suffix) : undefined}`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-radio-button", tags, suffix)} part="radio" ?disabled="${this.isInactive}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabelRadioButton)}" tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-singleSelectionElement" class="ui5-li-singlesel-radiobtn" ?checked="${this.selected}" @click="${this.onSingleSelectionComponentPress}"></${(0, _LitRenderer.scopeTag)("ui5-radio-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-radio-button part="radio" ?disabled="${this.isInactive}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabelRadioButton)}" tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-singleSelectionElement" class="ui5-li-singlesel-radiobtn" ?checked="${this.selected}" @click="${this.onSingleSelectionComponentPress}"></ui5-radio-button>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)} part="checkbox" ?disabled="${this.isInactive}" ?indeterminate=${this.indeterminate} tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-multiSelectionElement" class="ui5-li-multisel-cb" ?checked="${this.selected}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabel)}" @click="${this.onMultiSelectionComponentPress}"></${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-checkbox part="checkbox" ?disabled="${this.isInactive}" ?indeterminate=${this.indeterminate} tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-multiSelectionElement" class="ui5-li-multisel-cb" ?checked="${this.selected}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabel)}" @click="${this.onMultiSelectionComponentPress}"></ui5-checkbox>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-li-deletebtn">${this.hasDeleteButtonSlot ? block5.call(this, context, tags, suffix) : block6.call(this, context, tags, suffix)}</div>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="deleteButton"></slot>`;
  }
  function block6(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} part="delete-button" tabindex="-1" data-sap-no-tab-ref id="${(0, _LitRenderer.ifDefined)(this._id)}-deleteSelectionElement" design="Transparent" icon="decline" ?disabled="${this.disableDeleteButton}" @click="${this.onDelete}" tooltip="${(0, _LitRenderer.ifDefined)(this.deleteText)}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button part="delete-button" tabindex="-1" data-sap-no-tab-ref id="${(0, _LitRenderer.ifDefined)(this._id)}-deleteSelectionElement" design="Transparent" icon="decline" ?disabled="${this.disableDeleteButton}" @click="${this.onDelete}" tooltip="${(0, _LitRenderer.ifDefined)(this.deleteText)}"></ui5-button>`;
  }
  function block7(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-li-imgContent"><slot name="imageContent"></slot></div>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.displayImage ? block9.call(this, context, tags, suffix) : undefined}`;
  }
  function block9(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-avatar", tags, suffix)} shape="Square" class="ui5-li-img"><img src="${(0, _LitRenderer.ifDefined)(this.image)}" class="ui5-li-img-inner" /></${(0, _LitRenderer.scopeTag)("ui5-avatar", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-avatar shape="Square" class="ui5-li-img"><img src="${(0, _LitRenderer.ifDefined)(this.image)}" class="ui5-li-img-inner" /></ui5-avatar>`;
  }
  function block10(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} part="icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}" class="ui5-li-icon" accessible-role="presentation" aria-hidden="true"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon part="icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}" class="ui5-li-icon" accessible-role="presentation" aria-hidden="true"></ui5-icon>`;
  }
  function block11(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-li-description-info-wrapper"><span part="description" class="ui5-li-desc">${(0, _LitRenderer.ifDefined)(this.description)}</span>${this.additionalText ? block12.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block12(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span part="additional-text" class="ui5-li-additional-text">${(0, _LitRenderer.ifDefined)(this.additionalText)}</span>`;
  }
  function block13(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.type)}</span>`;
  }
  function block14(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.additionalText ? block15.call(this, context, tags, suffix) : undefined}`;
  }
  function block15(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span part="additional-text" class="ui5-li-additional-text">${(0, _LitRenderer.ifDefined)(this.additionalText)}</span>`;
  }
  function block16(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} part="icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}" class="ui5-li-icon" accessible-role="presentation" aria-hidden="true"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon part="icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}" class="ui5-li-icon" accessible-role="presentation" aria-hidden="true"></ui5-icon>`;
  }
  function block17(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-li-detailbtn"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} part="detail-button" design="Transparent" icon="edit" @click="${this.onDetailClick}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="ui5-li-detailbtn"><ui5-button part="detail-button" design="Transparent" icon="edit" @click="${this.onDetailClick}"></ui5-button></div>`;
  }
  function block18(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name ="slim-arrow-right"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name ="slim-arrow-right"></ui5-icon>`;
  }
  function block19(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-li-navigated"></div>`;
  }
  function block20(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.modeSingleSelect ? block21.call(this, context, tags, suffix) : undefined}${this.modeMultiSelect ? block22.call(this, context, tags, suffix) : undefined}${this.renderDeleteButton ? block23.call(this, context, tags, suffix) : undefined}`;
  }
  function block21(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-radio-button", tags, suffix)} part="radio" ?disabled="${this.isInactive}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabelRadioButton)}" tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-singleSelectionElement" class="ui5-li-singlesel-radiobtn" ?checked="${this.selected}" @click="${this.onSingleSelectionComponentPress}"></${(0, _LitRenderer.scopeTag)("ui5-radio-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-radio-button part="radio" ?disabled="${this.isInactive}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabelRadioButton)}" tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-singleSelectionElement" class="ui5-li-singlesel-radiobtn" ?checked="${this.selected}" @click="${this.onSingleSelectionComponentPress}"></ui5-radio-button>`;
  }
  function block22(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)} part="checkbox" ?disabled="${this.isInactive}" ?indeterminate=${this.indeterminate} tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-multiSelectionElement" class="ui5-li-multisel-cb" ?checked="${this.selected}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabel)}" @click="${this.onMultiSelectionComponentPress}"></${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-checkbox part="checkbox" ?disabled="${this.isInactive}" ?indeterminate=${this.indeterminate} tabindex="-1" id="${(0, _LitRenderer.ifDefined)(this._id)}-multiSelectionElement" class="ui5-li-multisel-cb" ?checked="${this.selected}" accessible-name="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLabel)}" @click="${this.onMultiSelectionComponentPress}"></ui5-checkbox>`;
  }
  function block23(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-li-deletebtn">${this.hasDeleteButtonSlot ? block24.call(this, context, tags, suffix) : block25.call(this, context, tags, suffix)}</div>`;
  }
  function block24(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="deleteButton"></slot>`;
  }
  function block25(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} part="delete-button" tabindex="-1" data-sap-no-tab-ref id="${(0, _LitRenderer.ifDefined)(this._id)}-deleteSelectionElement" design="Transparent" icon="decline" ?disabled="${this.disableDeleteButton}" @click="${this.onDelete}" tooltip="${(0, _LitRenderer.ifDefined)(this.deleteText)}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button part="delete-button" tabindex="-1" data-sap-no-tab-ref id="${(0, _LitRenderer.ifDefined)(this._id)}-deleteSelectionElement" design="Transparent" icon="decline" ?disabled="${this.disableDeleteButton}" @click="${this.onDelete}" tooltip="${(0, _LitRenderer.ifDefined)(this.deleteText)}"></ui5-button>`;
  }
  var _default = block0;
  _exports.default = _default;
});