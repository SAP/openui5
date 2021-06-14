sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<section class="ui5-carousel-root" tabindex="0" role="listbox" aria-activedescendant="${ifDefined__default(context.ariaActiveDescendant)}" @keydown=${context._onkeydown} @mouseout="${context._onmouseout}" @mouseover="${context._onmouseover}"><div class="${litRender.classMap(context.classes.viewport)}"><div class="${litRender.classMap(context.classes.content)}" style="${litRender.styleMap(context.styles.content)}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block1(item)) }</div></div>${ context.arrows.content ? block2(context) : undefined }${ context.renderNavigation ? block3(context) : undefined }</div></section> `; };
	const block1 = (item, index, context) => { return litRender.html`<div id="${ifDefined__default(item.id)}" class="ui5-carousel-item ${ifDefined__default(item.classes)}" style="width: ${ifDefined__default(item.width)}px;" role="option" aria-posinset="${ifDefined__default(item.posinset)}" aria-setsize="${ifDefined__default(item.setsize)}"><slot name="${ifDefined__default(item.item._individualSlot)}" tabindex="${ifDefined__default(item.tabIndex)}"></slot></div>`; };
	const block2 = (context) => { return litRender.html`<div class="ui5-carousel-navigation-arrows"><ui5-button arrow-back title="${ifDefined__default(context.previousPageText)}" class="ui5-carousel-navigation-button ${litRender.classMap(context.classes.navPrevButton)}" icon="slim-arrow-left" tabindex="-1" @click=${context.navigateLeft}></ui5-button><ui5-button arrow-forward title="${ifDefined__default(context.nextPageText)}" class="ui5-carousel-navigation-button ${litRender.classMap(context.classes.navNextButton)}" icon="slim-arrow-right" tabindex="-1" @click=${context.navigateRight}></ui5-button></div>`; };
	const block3 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.navigation)}">${ context.arrows.navigation ? block4(context) : undefined }<div class="ui5-carousel-navigation">${ !context.hidePageIndicator ? block5(context) : undefined }</div>${ context.arrows.navigation ? block9(context) : undefined }</div>`; };
	const block4 = (context) => { return litRender.html`<ui5-button arrow-back title="${ifDefined__default(context.previousPageText)}" class="ui5-carousel-navigation-button ${litRender.classMap(context.classes.navPrevButton)}" icon="slim-arrow-left" tabindex="-1" @click=${context.navigateLeft}></ui5-button>`; };
	const block5 = (context) => { return litRender.html`${ context.isPageTypeDots ? block6(context) : block8(context) }`; };
	const block6 = (context) => { return litRender.html`${ litRender.repeat(context.dots, (item, index) => item._id || index, (item, index) => block7(item)) }`; };
	const block7 = (item, index, context) => { return litRender.html`<div role="img" aria-label="${ifDefined__default(item.ariaLabel)}" ?active="${item.active}" class="ui5-carousel-navigation-dot"></div>`; };
	const block8 = (context) => { return litRender.html`<ui5-label>${ifDefined__default(context.selectedIndexToShow)}&nbsp;${ifDefined__default(context.ofText)}&nbsp;${ifDefined__default(context.pagesCount)}</ui5-label>`; };
	const block9 = (context) => { return litRender.html`<ui5-button arrow-forward title="${ifDefined__default(context.nextPageText)}" class="ui5-carousel-navigation-button ${litRender.classMap(context.classes.navNextButton)}" icon="slim-arrow-right" tabindex="-1" @click=${context.navigateRight}></ui5-button>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
