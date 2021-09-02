sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-dialog", tags, suffix)} header-text="${litRender.ifDefined(context.moreColorsFeature.colorPaletteDialogTitle)}"><div class="ui5-cp-dialog-content"><${litRender.scopeTag("ui5-color-picker", tags, suffix)}></${litRender.scopeTag("ui5-color-picker", tags, suffix)}></div><div slot="footer" class="ui5-cp-dialog-footer"><${litRender.scopeTag("ui5-button", tags, suffix)} design="Transparent" @click="${context._chooseCustomColor}">${litRender.ifDefined(context.moreColorsFeature.colorPaletteDialogOKButton)}</${litRender.scopeTag("ui5-button", tags, suffix)}><${litRender.scopeTag("ui5-button", tags, suffix)} design="Transparent" @click="${context._closeDialog}">${litRender.ifDefined(context.moreColorsFeature.colorPaletteCancelButton)}</${litRender.scopeTag("ui5-button", tags, suffix)}></div></${litRender.scopeTag("ui5-dialog", tags, suffix)}>`;

	return block0;

});
