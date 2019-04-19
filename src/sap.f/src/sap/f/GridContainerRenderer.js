/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";

		/**
		 * GridContainer renderer
		 * @namespace
		 */
		var GridContainerRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} control an object representation of the control that should be rendered
		 */
		GridContainerRenderer.render = function(rm, control) {

			rm.write('<div');
			rm.writeControlData(control);

			rm.addClass("sapFGridContainer");

			if (control.getSnapToRow()) {
				rm.addClass("sapFGridContainerSnapToRow");
			}

			if (control.getAllowDenseFill()) {
				rm.addClass("sapFGridContainerDenseFill");
			}

			rm.writeClasses();

			// Add inline styles
			if (control.getWidth()) {
				rm.addStyle("width", control.getWidth());
			}
			this.addGridStyles(rm, control);
			rm.writeStyles();

			// Add tooltip
			var tooltip = control.getTooltip_AsString();
			if (tooltip) {
				rm.writeAttributeEscaped("title", tooltip);
			}

			// Close opening tag
			rm.write(">");

			control.getItems().forEach(function (oItem) {
				this.renderItem(rm, oItem, control);
			}.bind(this));

			rm.write("</div>");
		};

		/**
		 * Adds grid styles depending on the layout settings
		 *
		 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		GridContainerRenderer.addGridStyles = function(rm, oControl) {
			var mStyles = oControl._getActiveGridStyles();
			for (var sName in mStyles) {
				rm.addStyle(sName, mStyles[sName]);
			}
		};

		GridContainerRenderer.renderItem = function(rm, oItem, oControl) {
			rm.write("<div");
			rm.addClass("sapFGridContainerItemWrapper");

			var oLayoutData = oItem.getLayoutData();
			if (oLayoutData) {
				var iItemColumns = oLayoutData.getColumns(),
					iTotalColumns = oControl.getActiveLayoutSettings().getColumns();

				if (iItemColumns && iTotalColumns) {
					// do not allow items to have more columns than total columns, else the layout brakes
					iItemColumns = Math.min(iItemColumns, iTotalColumns);
				}

				if (iItemColumns) {
					rm.addStyle("grid-column", "span " + iItemColumns);
				}

				if (oControl.getInlineBlockLayout()) {
					rm.addStyle("grid-row", "span 1");
				} else if (oLayoutData.getRows() || oLayoutData.getMinRows()) {
					rm.addStyle("grid-row", "span " + oLayoutData.getActualRows());
				}

				if (!oLayoutData.hasAutoHeight()) {
					rm.addClass("sapFGridContainerItemFixedRows");
				}
			}

			rm.writeClasses();
			rm.writeStyles();
			rm.write(">");

			rm.renderControl(oItem);
			rm.write("</div>");
		};

		return GridContainerRenderer;

	}, /* bExport= */ true);
