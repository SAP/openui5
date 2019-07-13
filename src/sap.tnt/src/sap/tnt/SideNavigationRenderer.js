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
		var SideNavigationRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager}
		 *		  rm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control}
		 *		  control an object representation of the control that should be rendered
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

			rm.write('<div');
			rm.writeControlData(control);

			rm.writeAttribute("role", 'navigation');

			rm.addClass('sapTntSideNavigation');
			rm.addClass("sapContrast sapContrastPlus");

			if (!isExpanded) {
				rm.addClass('sapTntSideNavigationNotExpanded');
				rm.addClass('sapTntSideNavigationNotExpandedWidth');
			}

			if (!isExpanded && itemAggregation) {
				itemAggregation.setExpanded(false);
			}

			if (!isExpanded && fixedItemAggregation) {
				fixedItemAggregation.setExpanded(false);
			}

			rm.writeClasses();
			rm.write('>');
		};

		SideNavigationRenderer.endSideNavigation = function (rm, control) {
			rm.write('</div>');
		};

		SideNavigationRenderer.renderArrowUp = function (rm, control){

			rm.renderControl(control._getTopArrowControl());
		};

		SideNavigationRenderer.renderArrowDown = function (rm, control){

			rm.renderControl(control._getBottomArrowControl());
		};

		SideNavigationRenderer.renderItem = function (rm, control) {
			var itemAggregation = control.getAggregation('item');

			rm.write('<div id="' + control.getId() + '-Flexible" tabindex="-1" class="sapTntSideNavigationFlexible sapTntSideNavigationVerticalScrolling">');
			rm.write('<div id="' + control.getId() + '-Flexible-Content" class="sapTntSideNavigationFlexibleContent">');
			rm.renderControl(itemAggregation);
			rm.write('</div></div>');
		};

		SideNavigationRenderer.renderFixedItem = function (rm, control) {
			var fixedItemAggregation = control.getAggregation('fixedItem');

			if (fixedItemAggregation === null) {
				return;
			}

			if (fixedItemAggregation.getExpanded() === false) {
				fixedItemAggregation.setExpanded(false);
			}

			rm.write('<div class="sapTntSideNavigationSeparator" role="separator" aria-orientation="horizontal"></div>');

			rm.write('<div class="sapTntSideNavigationFixed">');
			rm.renderControl(fixedItemAggregation);
			rm.write('</div>');
		};

		SideNavigationRenderer.renderFooter = function (rm, control) {
			if (control.getAggregation('footer')) {
				rm.write('<footer class="sapTntSideNavigationFooter">');
				rm.renderControl(control.getAggregation('footer'));
				rm.write('</footer>');
			}
		};

		return SideNavigationRenderer;

	}, /* bExport= */ true);
