sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`${ context.domRendered ? block1(context) : undefined } `;
	const block1 = (context, tags, suffix) => litRender.html`<div class="ui5-toast-root" role="alert" style="${litRender.styleMap(context.styles.root)}" @mouseover="${context._onmouseover}" @mouseleave="${context._onmouseleave}" @transitionend="${context._ontransitionend}"><bdi><slot></slot></bdi></div>`;

	return block0;

});
