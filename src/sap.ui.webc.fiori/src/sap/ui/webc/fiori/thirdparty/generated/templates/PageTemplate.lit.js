sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-page-root"><header class="ui5-page-header-root" id="ui5-page-header"><slot name="header"></slot></header><section class="ui5-page-content-root" style="${litRender.styleMap(context.styles.content)}"><slot></slot></section><footer class="ui5-page-footer-root" style="${litRender.styleMap(context.styles.footer)}"><slot name="footer"></slot></footer></div>`;

	return block0;

});
