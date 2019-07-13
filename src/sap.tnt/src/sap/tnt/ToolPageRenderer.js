/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device"],
	function (Device) {
		'use strict';

		/**
		 * ToolPage renderer
		 * @namespace
		 */
		var ToolPageRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager}
		 *          rm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control}
		 *          control an object representation of the control that should be rendered
		 */
		ToolPageRenderer.render = function (rm, control) {

			var header = control.getAggregation('header');

			rm.write('<div');
			rm.writeControlData(control);
			rm.addClass('sapTntToolPage');

			if (header) {
				rm.addClass('sapTntToolPageWithHeader');
			}

			rm.writeClasses();
			rm.write('>');

			if (header) {
				rm.write("<header>");
				rm.write('<div id="' + control.getId() + '-header" class="sapTntToolPageHeader">');
				rm.renderControl(header);
				rm.write('</div>');
				rm.write("</header>");
			}

			this.renderContentWrapper(rm, control);

			rm.write('</div>');
		};

		ToolPageRenderer.renderContentWrapper = function (rm, control) {
			var isDesktop = Device.system.desktop;

			rm.write('<div class="sapTntToolPageContentWrapper');

			if (!isDesktop || !control.getSideExpanded()) {
				rm.write(' sapTntToolPageAsideCollapsed');
			}

			rm.write('">');
			this.renderAsideContent(rm, control);
			this.renderMainContent(rm, control);
			rm.write('</div>');
		};

		ToolPageRenderer.renderAsideContent = function (rm, control) {
			if (!control.getSideContent()) {
				return;
			}

			var isDesktop = Device.system.desktop;
			var sideContentAggregation = control.getAggregation('sideContent');
			var isSideExpanded = control.getSideExpanded();

			rm.write('<aside id="' + control.getId() + '-aside" class="sapTntToolPageAside">');

			rm.write('<div class="sapTntToolPageAsideContent">');

			if (sideContentAggregation && sideContentAggregation.getExpanded() !== isSideExpanded) {
				sideContentAggregation.setExpanded(isSideExpanded);
			}

			if (!isDesktop) {
				control.setSideExpanded(false);
			}

			// The render of the aggregation should be after the above statement,
			// due to class manipulations inside the aggregation.
			rm.renderControl(sideContentAggregation);

			rm.write('</div>');

			rm.write('</aside>');
		};

		ToolPageRenderer.renderMainContent = function (rm, control) {
			var mainContentAggregations = control.getAggregation('mainContents');

			if (mainContentAggregations) {
				rm.write('<div id="' + control.getId() + '-main" class="sapTntToolPageMain">');

				rm.write('<div class="sapTntToolPageMainContent">');
				rm.write('<div class="sapTntToolPageMainContentWrapper">');
				mainContentAggregations.forEach(rm.renderControl, rm);
				rm.renderControl();
				rm.write('</div>');
				rm.write('</div>');

				rm.write('</div>');
			}
		};

		return ToolPageRenderer;

	}, /* bExport= */ true);
