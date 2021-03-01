sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-uc-root" role="region" aria-roledescription="${ifDefined__default(context._roleDescription)}" @drop="${context._ondrop}"><div class="ui5-uc-header"><slot name="header"></slot></div><div class="${litRender.classMap(context.classes.content)}"><ui5-list mode="${ifDefined__default(context.mode)}" @ui5-selection-change="${ifDefined__default(context._onSelectionChange)}" @ui5-item-delete="${ifDefined__default(context._onItemDelete)}"><slot></slot></ui5-list>${ context._showNoData ? block1(context) : block2(context) }</div></div>`; };
	const block1 = (context) => { return litRender.html`<div class="uc-no-files"><div class="icon-container"><ui5-icon name="document"></ui5-icon></div><ui5-title level="H2" wrapping-type="Normal">${ifDefined__default(context._noDataText)}</ui5-title><ui5-label class="subtitle" wrapping-type="Normal">${ifDefined__default(context._noDataDescription)}</ui5-label></div>`; };
	const block2 = (context) => { return litRender.html`${ context._showDndOverlay ? block3(context) : undefined }`; };
	const block3 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.dndOverlay)}" @dragenter="${context._ondragenter}" @dragleave="${context._ondragleave}" @dragover="${context._ondragover}"><ui5-icon name="upload-to-cloud"></ui5-icon><span class="dnd-overlay-text">${ifDefined__default(context._dndOverlayText)}</span></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
