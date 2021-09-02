sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<li tabindex="${litRender.ifDefined(context._tabIndex)}" class="ui5-ghli-root ${litRender.classMap(context.classes.main)}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}" @keydown="${context._onkeydown}" role="option" style="list-style-type: none;"><span class="ui5-hidden-text">${litRender.ifDefined(context.groupHeaderText)}${litRender.ifDefined(context.accessibleName)}</span><div id="${litRender.ifDefined(context._id)}-content" class="ui5-li-content"><span class="ui5-ghli-title"><slot></slot></span></div></li>`;

	return block0;

});
