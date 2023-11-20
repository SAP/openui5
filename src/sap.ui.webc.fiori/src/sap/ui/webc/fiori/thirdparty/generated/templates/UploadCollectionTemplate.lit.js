sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-uc-root" role="region" aria-roledescription="${(0, _LitRenderer.ifDefined)(this._roleDescription)}" @drop="${this._ondrop}" @ui5-_uci-delete="${(0, _LitRenderer.ifDefined)(this._onItemDelete)}"><div class="${(0, _LitRenderer.classMap)(this.classes.content)}"><${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)} accessible-name="${(0, _LitRenderer.ifDefined)(this.accessibleName)}" mode="${(0, _LitRenderer.ifDefined)(this.mode)}" @ui5-selection-change="${(0, _LitRenderer.ifDefined)(this._onSelectionChange)}"><slot slot="header" name="header"></slot><slot></slot></${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)}>${this._showNoData ? block1.call(this, context, tags, suffix) : undefined}${this._showDndOverlay ? block2.call(this, context, tags, suffix) : undefined}</div></div>` : (0, _LitRenderer.html)`<div class="ui5-uc-root" role="region" aria-roledescription="${(0, _LitRenderer.ifDefined)(this._roleDescription)}" @drop="${this._ondrop}" @ui5-_uci-delete="${(0, _LitRenderer.ifDefined)(this._onItemDelete)}"><div class="${(0, _LitRenderer.classMap)(this.classes.content)}"><ui5-list accessible-name="${(0, _LitRenderer.ifDefined)(this.accessibleName)}" mode="${(0, _LitRenderer.ifDefined)(this.mode)}" @ui5-selection-change="${(0, _LitRenderer.ifDefined)(this._onSelectionChange)}"><slot slot="header" name="header"></slot><slot></slot></ui5-list>${this._showNoData ? block1.call(this, context, tags, suffix) : undefined}${this._showDndOverlay ? block2.call(this, context, tags, suffix) : undefined}</div></div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.noFiles)}"><${(0, _LitRenderer.scopeTag)("ui5-illustrated-message", tags, suffix)} name="Tent"><${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)} slot="title" class="title" level="H2">${(0, _LitRenderer.ifDefined)(this._noDataText)}</${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)}><span slot="subtitle" class="subtitle">${(0, _LitRenderer.ifDefined)(this._noDataDescription)}</span></${(0, _LitRenderer.scopeTag)("ui5-illustrated-message", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.noFiles)}"><ui5-illustrated-message name="Tent"><ui5-title slot="title" class="title" level="H2">${(0, _LitRenderer.ifDefined)(this._noDataText)}</ui5-title><span slot="subtitle" class="subtitle">${(0, _LitRenderer.ifDefined)(this._noDataDescription)}</span></ui5-illustrated-message></div>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.dndOverlay)}" @dragenter="${this._ondragenter}" @dragleave="${this._ondragleave}" @dragover="${this._ondragover}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="upload-to-cloud"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}><span class="dnd-overlay-text">${(0, _LitRenderer.ifDefined)(this._dndOverlayText)}</span></div>` : (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.dndOverlay)}" @dragenter="${this._ondragenter}" @dragleave="${this._ondragleave}" @dragover="${this._ondragover}"><ui5-icon name="upload-to-cloud"></ui5-icon><span class="dnd-overlay-text">${(0, _LitRenderer.ifDefined)(this._dndOverlayText)}</span></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});