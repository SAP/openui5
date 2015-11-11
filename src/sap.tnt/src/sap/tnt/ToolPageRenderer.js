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
			rm.addClass('sapMToolPage');
			rm.writeClasses();
			rm.write('>');

			this.renderHeader(rm, control);
			this.renderContentWrapper(rm, control);

			rm.write('</div>');
		};

		ToolPageRenderer.renderHeader = function (rm, control) {
			if (control.getAggregation('header')) {
				rm.write('<div id="' + control.getId() + '-header" class="sapMToolPageHeader">');
				rm.renderControl(control.getAggregation('header'));
				rm.write('</div>');
			}
		};

		ToolPageRenderer.renderContentWrapper = function (rm, control) {
			var isScreenSizeForTablet = document.documentElement.classList.contains('sapUiMedia-Std-Tablet');
			var isScreenSizeForPhone = document.documentElement.classList.contains('sapUiMedia-Std-Phone');

			rm.write('<div class="sapMToolPageContentWrapper');

			if (isScreenSizeForPhone || isScreenSizeForTablet) {
				rm.write(' sapMToolPageAsideCollapsed');
			}

			rm.write('">');
			this.renderAsideContent(rm, control);
			this.renderMainContent(rm, control);
			rm.write('</div>');
		};

		ToolPageRenderer.renderAsideContent = function (rm, control) {
			var isScreenSizeForTablet = document.documentElement.classList.contains('sapUiMedia-Std-Tablet');
			var isScreenSizeForPhone = document.documentElement.classList.contains('sapUiMedia-Std-Phone');
			var sideContentAggregation = control.getAggregation('sideContent');
			var isSideExpanded = control.getSideExpanded();

			rm.write('<aside id="' + control.getId() + '-aside" class="sapMToolPageAside">');

			rm.write('<div class="sapMToolPageAsideContent">');

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

			rm.write('<div id="' + control.getId() + '-main" class="sapMToolPageMain">');

			rm.write('<div class="sapMToolPageMainContent">');
			rm.write('<div class="sapMToolPageMainContentWrapper">');
			mainContentAggregations.forEach(rm.renderControl);
			rm.renderControl();
			rm.write('</div>');
			rm.write('</div>');

			rm.write('</div>');
		};

		return ToolPageRenderer;

	}, /* bExport= */ true);
