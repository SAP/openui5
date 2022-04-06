sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-popover", tags, suffix)} skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="Left"><div slot="header" class="${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.popoverHeader)}">${ context._valueStateMessageInputIcon ? block1(context, tags, suffix) : undefined }${ context.shouldDisplayDefaultValueStateMessage ? block2(context) : block3(context) }</div></${litRender.scopeTag("ui5-popover", tags, suffix)}>` : litRender.html`<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="Left"><div slot="header" class="${litRender.classMap(context.classes.popoverValueState)}" style="${litRender.styleMap(context.styles.popoverHeader)}">${ context._valueStateMessageInputIcon ? block1(context, tags, suffix) : undefined }${ context.shouldDisplayDefaultValueStateMessage ? block2(context) : block3(context) }</div></ui5-popover>`;
	const block1 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${litRender.ifDefined(context._valueStateMessageInputIcon)}"></${litRender.scopeTag("ui5-icon", tags, suffix)}>` : litRender.html`<ui5-icon class="ui5-input-value-state-message-icon" name="${litRender.ifDefined(context._valueStateMessageInputIcon)}"></ui5-icon>`;
	const block2 = (context, tags, suffix) => litRender.html`${litRender.ifDefined(context.valueStateText)}`;
	const block3 = (context, tags, suffix) => litRender.html`${ litRender.repeat(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block4(item)) }`;
	const block4 = (item, index, context, tags, suffix) => litRender.html`${litRender.ifDefined(item)}`;

	return block0;

});
