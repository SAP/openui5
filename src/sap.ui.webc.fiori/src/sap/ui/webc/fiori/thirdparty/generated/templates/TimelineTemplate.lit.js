sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-timeline-root" @focusin=${context._onfocusin} dir="${litRender.ifDefined(context.effectiveDir)}" @keydown=${context._onkeydown}><div class="ui5-timeline-scroll-container"><ul class="ui5-timeline-list" role="listbox" aria-live="polite" aria-label="${litRender.ifDefined(context.accessibleName)}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block1(item)) }</ul></div></div>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`<li class="ui5-timeline-list-item" style="list-style-type: none;"><slot name="${litRender.ifDefined(item._individualSlot)}"></slot></li>`;

	return block0;

});
