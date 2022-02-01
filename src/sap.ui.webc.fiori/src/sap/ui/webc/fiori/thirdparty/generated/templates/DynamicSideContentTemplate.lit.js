sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-dsc-root" style="${litRender.styleMap(context.styles.root)}"><div class="${litRender.classMap(context.classes.main)}" style="${litRender.styleMap(context.styles.main)}"><slot></slot></div><aside role="complementary" aria-label="${litRender.ifDefined(context.accInfo.label)}" class="${litRender.classMap(context.classes.side)}" style="${litRender.styleMap(context.styles.side)}"><slot name="sideContent"></slot></aside></div>`;

	return block0;

});
