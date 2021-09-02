sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-popover", tags, suffix)} skip-registry-update _disable-initial-focus prevent-focus-restore no-padding hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="Left"><div slot="header" class="${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.popoverHeader)}">${ context.shouldDisplayDefaultValueStateMessage ? block1(context) : block2(context) }</div></${litRender.scopeTag("ui5-popover", tags, suffix)}>`;
	const block1 = (context, tags, suffix) => litRender.html`${litRender.ifDefined(context.valueStateText)}`;
	const block2 = (context, tags, suffix) => litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block3(item)) }`;
	const block3 = (item, index, context, tags, suffix) => litRender.html`${litRender.ifDefined(item)}`;

	return block0;

});
