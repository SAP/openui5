/*!
 * ${copyright}
 */

sap.ui.define([],
	function () {
		'use strict';

		/**
		 * SideNavigation renderer.
		 * @namespace
		 */
		var SideNavigationRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} control an object representation of the control that should be rendered
		 */
		SideNavigationRenderer.render = function (rm, control) {
			this.startSideNavigation(rm, control);

			this.renderArrowUp(rm, control);

			this.renderItem(rm, control);

			this.renderArrowDown(rm, control);

			this.renderFixedItem(rm, control);

			this.renderFooter(rm, control);

			this.endSideNavigation(rm, control);
		};

		SideNavigationRenderer.startSideNavigation = function (rm, control) {
			var itemAggregation = control.getAggregation('item');
			var fixedItemAggregation = control.getAggregation('fixedItem');
			var isExpanded = control.getExpanded();

			rm.openStart('div', control);

			rm.attr("role", 'navigation');

			rm.class('sapTntSideNavigation');
			rm.class("sapContrast");
			rm.class("sapContrastPlus");

			if (!isExpanded) {
				rm.class('sapTntSideNavigationNotExpanded');
				rm.class('sapTntSideNavigationNotExpandedWidth');
			}

			if (!isExpanded && itemAggregation) {
				itemAggregation.setExpanded(false);
			}

			if (!isExpanded && fixedItemAggregation) {
				fixedItemAggregation.setExpanded(false);
			}

			rm.openEnd();
		};

		SideNavigationRenderer.endSideNavigation = function (rm, control) {
			rm.close('div');
		};

		SideNavigationRenderer.renderArrowUp = function (rm, control){

			rm.renderControl(control._getTopArrowControl());
		};

		SideNavigationRenderer.renderArrowDown = function (rm, control){

			rm.renderControl(control._getBottomArrowControl());
		};

		SideNavigationRenderer.renderItem = function (rm, control) {
			var itemAggregation = control.getAggregation('item');

			rm.openStart('div', control.getId() + '-Flexible');
			rm.attr('tabindex', '-1');
			rm.class('sapTntSideNavigationFlexible');
			rm.class('sapTntSideNavigationVerticalScrolling');
			rm.openEnd();

			rm.openStart('div', control.getId() + '-Flexible-Content');
			rm.class('sapTntSideNavigationFlexibleContent');
			rm.openEnd();

			rm.renderControl(itemAggregation);

			rm.close('div');
			rm.close('div');
		};

		SideNavigationRenderer.renderFixedItem = function (rm, control) {
			var fixedItemAggregation = control.getAggregation('fixedItem');

			if (fixedItemAggregation === null) {
				return;
			}

			if (fixedItemAggregation.getExpanded() === false) {
				fixedItemAggregation.setExpanded(false);
			}

			rm.openStart('div');
			rm.attr('role', 'separator');
			rm.attr('aria-orientation', 'horizontal');
			rm.class('sapTntSideNavigationSeparator');
			rm.openEnd();
			rm.close('div');

			rm.openStart('div');
			rm.class('sapTntSideNavigationFixed');
			rm.openEnd();

			rm.renderControl(fixedItemAggregation);
			rm.close('div');
		};

		SideNavigationRenderer.renderFooter = function (rm, control) {
			if (control.getAggregation('footer')) {
				rm.openStart('footer');
				rm.class('sapTntSideNavigationFooter');
				rm.openEnd();
				rm.renderControl(control.getAggregation('footer'));
				rm.close('footer');
			}
		};

		return SideNavigationRenderer;

	}, /* bExport= */ true);
