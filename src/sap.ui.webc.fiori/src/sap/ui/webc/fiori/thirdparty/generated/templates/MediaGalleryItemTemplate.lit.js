sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-media-gallery-item-root" tabindex="${litRender.ifDefined(context.tabIndex)}" data-sap-focus-ref @focusout="${context._onfocusout}" @focusin="${context._onfocusin}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" role="${litRender.ifDefined(context._role)}"><div class="ui5-media-gallery-item-mask-layer"></div><div class="ui5-media-gallery-item-wrapper" style="${litRender.styleMap(context.styles.wrapper)}">${ context._showBackgroundIcon ? block1(context, tags, suffix) : undefined }${ context._useContent ? block2() : undefined }${ context._useThumbnail ? block3() : undefined }</div></div>`;
	const block1 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} name="background"></${litRender.scopeTag("ui5-icon", tags, suffix)}>` : litRender.html`<ui5-icon name="background"></ui5-icon>`;
	const block2 = (context, tags, suffix) => litRender.html`<slot></slot>`;
	const block3 = (context, tags, suffix) => litRender.html`<slot name="thumbnail"></slot>`;

	return block0;

});
