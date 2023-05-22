sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-tree-list", tags, suffix)} .mode="${(0, _LitRenderer.ifDefined)(this.mode)}" .headerText="${(0, _LitRenderer.ifDefined)(this.headerText)}" .footerText="${(0, _LitRenderer.ifDefined)(this.footerText)}" .noDataText="${(0, _LitRenderer.ifDefined)(this.noDataText)}" .accessibleRole="${(0, _LitRenderer.ifDefined)(this._role)}" .accessibleName="${(0, _LitRenderer.ifDefined)(this._label)}" .accessibleRoleDescription="${(0, _LitRenderer.ifDefined)(this.accessibleRoleDescription)}" @ui5-item-click="${(0, _LitRenderer.ifDefined)(this._onListItemClick)}" @ui5-item-delete="${(0, _LitRenderer.ifDefined)(this._onListItemDelete)}" @ui5-selection-change="${(0, _LitRenderer.ifDefined)(this._onListSelectionChange)}" @ui5-toggle="${(0, _LitRenderer.ifDefined)(this._onListItemToggle)}" @ui5-step-in="${(0, _LitRenderer.ifDefined)(this._onListItemStepIn)}" @ui5-step-out="${(0, _LitRenderer.ifDefined)(this._onListItemStepOut)}" @mouseover="${this._onListItemMouseOver}" @mouseout="${this._onListItemMouseOut}" class="ui5-tree-root">${this._hasHeader ? block1.call(this, context, tags, suffix) : undefined}<slot></slot></${(0, _LitRenderer.scopeTag)("ui5-tree-list", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-tree-list .mode="${(0, _LitRenderer.ifDefined)(this.mode)}" .headerText="${(0, _LitRenderer.ifDefined)(this.headerText)}" .footerText="${(0, _LitRenderer.ifDefined)(this.footerText)}" .noDataText="${(0, _LitRenderer.ifDefined)(this.noDataText)}" .accessibleRole="${(0, _LitRenderer.ifDefined)(this._role)}" .accessibleName="${(0, _LitRenderer.ifDefined)(this._label)}" .accessibleRoleDescription="${(0, _LitRenderer.ifDefined)(this.accessibleRoleDescription)}" @ui5-item-click="${(0, _LitRenderer.ifDefined)(this._onListItemClick)}" @ui5-item-delete="${(0, _LitRenderer.ifDefined)(this._onListItemDelete)}" @ui5-selection-change="${(0, _LitRenderer.ifDefined)(this._onListSelectionChange)}" @ui5-toggle="${(0, _LitRenderer.ifDefined)(this._onListItemToggle)}" @ui5-step-in="${(0, _LitRenderer.ifDefined)(this._onListItemStepIn)}" @ui5-step-out="${(0, _LitRenderer.ifDefined)(this._onListItemStepOut)}" @mouseover="${this._onListItemMouseOver}" @mouseout="${this._onListItemMouseOut}" class="ui5-tree-root">${this._hasHeader ? block1.call(this, context, tags, suffix) : undefined}<slot></slot></ui5-tree-list>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="header" slot="header"></slot>`;
  }
  var _default = block0;
  _exports.default = _default;
});