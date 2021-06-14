sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div data-sap-ui-fastnavgroup="true" class="ui5-panel-root" role="${ifDefined__default(context.accRole)}" aria-label="${ifDefined__default(context.effectiveAccessibleName)}"><!-- header: either header or h1 with header text --><div @click="${context._headerClick}" @keydown="${context._headerKeyDown}" @keyup="${context._headerKeyUp}" class="ui5-panel-header" tabindex="${ifDefined__default(context.headerTabIndex)}" role="${ifDefined__default(context.accInfo.role)}" aria-expanded="${ifDefined__default(context.accInfo.ariaExpanded)}" aria-controls="${ifDefined__default(context.accInfo.ariaControls)}" aria-labelledby="${ifDefined__default(context.accInfo.ariaLabelledby)}">${ !context.fixed ? block1(context) : undefined }${ context._hasHeader ? block4() : block5(context) }</div><!-- content area --><div class="ui5-panel-content" id="${ifDefined__default(context._id)}-content" tabindex="-1" style="${litRender.styleMap(context.styles.content)}" part="content"><slot></slot></div></div>`; };
	const block1 = (context) => { return litRender.html`<div class="ui5-panel-header-button-root">${ context._hasHeader ? block2(context) : block3(context) }</div>`; };
	const block2 = (context) => { return litRender.html`<ui5-button design="Transparent" class="ui5-panel-header-button ${litRender.classMap(context.classes.headerBtn)}" icon="slim-arrow-right" @click="${context._toggleButtonClick}" ._buttonAccInfo="${ifDefined__default(context.accInfo.button)}" aria-label="${ifDefined__default(context.accInfo.button.ariaLabelButton)}"></ui5-button>`; };
	const block3 = (context) => { return litRender.html`<ui5-icon class="ui5-panel-header-button ui5-panel-header-icon ${litRender.classMap(context.classes.headerBtn)}" name="slim-arrow-right"></ui5-icon>`; };
	const block4 = (context) => { return litRender.html`<slot name="header"></slot>`; };
	const block5 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}-header-title" role="heading" aria-level="${ifDefined__default(context.headerAriaLevel)}" class="ui5-panel-header-title">${ifDefined__default(context.headerText)}</div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
