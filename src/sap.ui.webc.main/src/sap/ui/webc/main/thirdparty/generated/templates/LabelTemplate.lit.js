sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<label class="ui5-label-root" dir="${litRender.ifDefined(context.effectiveDir)}" @click=${context._onclick} for="${litRender.ifDefined(context.for)}"><span class="${litRender.classMap(context.classes.textWrapper)}"><bdi id="${litRender.ifDefined(context._id)}-bdi"><slot></slot></bdi></span><span class="ui5-label-required-colon"></span></label>`;

	return block0;

});
