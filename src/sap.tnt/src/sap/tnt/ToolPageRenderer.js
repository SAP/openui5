/*!
 * ${copyright}
 */

sap.ui.define([],
	function () {
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
			rm.write('<div');
			rm.writeControlData(control);
			rm.addClass('sapTntToolPage');
			rm.writeClasses();
			rm.write('>');

			this.renderHeader(rm, control);
			this.renderContentWrapper(rm, control);

			rm.write('</div>');
		};

		ToolPageRenderer.renderHeader = function (rm, control) {
			if (control.getAggregation('header')) {
				rm.write('<div id="' + control.getId() + '-header" class="sapTntToolPageHeader">');
				rm.renderControl(control.getAggregation('header'));
				rm.write('</div>');
			}
		};

		ToolPageRenderer.renderContentWrapper = function (rm, control) {
			var isScreenSizeForTablet = sap.ui.Device.system.tablet;
			var isScreenSizeForPhone = sap.ui.Device.system.phone;

			rm.write('<div class="sapTntToolPageContentWrapper');

			if (isScreenSizeForPhone || isScreenSizeForTablet || !control.getSideExpanded()) {
				rm.write(' sapTntToolPageAsideCollapsed');
			}

			rm.write('">');
			this.renderAsideContent(rm, control);
			this.renderMainContent(rm, control);
			rm.write('</div>');
		};

		ToolPageRenderer.renderAsideContent = function (rm, control) {
			var isScreenSizeForTablet = sap.ui.Device.system.tablet;
			var isScreenSizeForPhone = sap.ui.Device.system.phone;
			var sideContentAggregation = control.getAggregation('sideContent');
			var isSideExpanded = control.getSideExpanded();

			rm.write('<aside id="' + control.getId() + '-aside" class="sapTntToolPageAside">');

			rm.write('<div class="sapTntToolPageAsideContent">');

			if (sideContentAggregation && sideContentAggregation.getExpanded() !== isSideExpanded) {
				sideContentAggregation.setExpanded(isSideExpanded);
			}

			if (isScreenSizeForTablet || isScreenSizeForPhone) {
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
				mainContentAggregations.forEach(rm.renderControl);
				rm.renderControl();
				rm.write('</div>');
				rm.write('</div>');

				rm.write('</div>');
			}
		};

		return ToolPageRenderer;

	}, /* bExport= */ true);
