sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-illustrated-message-root"><div class="ui5-illustrated-message-illustration">${(0, _LitRenderer.unsafeHTML)(this.effectiveIllustration)}</div>${this.hasTitle ? block1.call(this, context, tags, suffix) : undefined}${this.hasSubtitle ? block4.call(this, context, tags, suffix) : undefined}${this.hasActions ? block7.call(this, context, tags, suffix) : undefined}<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="ui5-illustrated-message-util">${blockSVG1.call(this, context, tags, suffix)}</svg></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.hasFormattedTitle ? block2.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="title"></slot>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)} level="H2" class="ui5-illustrated-message-title" wrapping-type="Normal">${(0, _LitRenderer.ifDefined)(this.effectiveTitleText)}</${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-title level="H2" class="ui5-illustrated-message-title" wrapping-type="Normal">${(0, _LitRenderer.ifDefined)(this.effectiveTitleText)}</ui5-title>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-illustrated-message-subtitle">${this.hasFormattedSubtitle ? block5.call(this, context, tags, suffix) : block6.call(this, context, tags, suffix)}</div>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="subtitle"></slot>`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.effectiveSubitleText)}`;
  }
  function block7(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-illustrated-message-actions"><slot></slot></div>`;
  }
  function blockSVG1(context, tags, suffix) {
    return (0, _LitRenderer.svg)`<defs><pattern id="sapIllus_PatternShadow" data-name="sapIllus_PatternShadow" width="3" height="5.5" patternUnits="userSpaceOnUse" viewBox="0 0 3 5.5"><rect class="sapIllus_NoColor sapIllus_NoColor_Fill" width="3" height="5.5" /><circle class="sapIllus_BrandColorPrimary sapIllus_BrandColorPrimary_Fill" cx="3" cy="5.5001" r="0.5" /><circle class="sapIllus_BrandColorPrimary sapIllus_BrandColorPrimary_Fill" cy="5.5001" r="0.5" /><circle class="sapIllus_BrandColorPrimary sapIllus_BrandColorPrimary_Fill" cx="1.5" cy="2.7501" r="0.5" /><circle class="sapIllus_BrandColorPrimary sapIllus_BrandColorPrimary_Fill" cx="3" cy="0.0001" r="0.5" /><circle class="sapIllus_BrandColorPrimary sapIllus_BrandColorPrimary_Fill" cy="0.0001" r="0.5" /></pattern><pattern id="sapIllus_PatternHighlight" data-name="sapIllus_PatternHighlight" width="3" height="5.5" patternTransform="translate(35.9059 309.6208)" patternUnits="userSpaceOnUse" viewBox="0 0 3 5.5"><rect class="sapIllus_NoColor sapIllus_NoColor_Fill" width="3" height="5.5" /><circle class="sapIllus_ObjectFillColor sapIllus_ObjectFillColor_Fill" cx="3.0001" cy="5.5001" r="0.5" /><circle class="sapIllus_ObjectFillColor sapIllus_ObjectFillColor_Fill" cx="0.0001" cy="5.5001" r="0.5" /><circle class="sapIllus_ObjectFillColor sapIllus_ObjectFillColor_Fill" cx="1.5001" cy="2.7501" r="0.5" /><circle class="sapIllus_ObjectFillColor sapIllus_ObjectFillColor_Fill" cx="3.0001" cy="0.0001" r="0.5" /><circle class="sapIllus_ObjectFillColor sapIllus_ObjectFillColor_Fill" cx="0.0001" cy="0.0001" r="0.5" /></pattern></defs>`;
  }
  ;
  var _default = block0;
  _exports.default = _default;
});