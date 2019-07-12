/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";
		/* global Map */

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

		/**
		 * Renders a single item in the grid.
		 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oItem The grid item
		 * @param {sap.ui.core.Control} oControl The grid
		 */
		GridContainerRenderer.renderItem = function(rm, oItem, oControl) {
			var mStylesInfo = GridContainerRenderer.getStylesForItemWrapper(oItem, oControl),
				mStyles = mStylesInfo.styles,
				aClasses = mStylesInfo.classes;

			rm.write("<div");

			mStyles.forEach(function (sValue, sKey) {
				rm.addStyle(sKey, sValue);
			});

			aClasses.forEach(function (sValue) {
				rm.addClass(sValue);
			});

			rm.writeClasses();
			rm.writeStyles();
			rm.write(">");

			rm.renderControl(oItem);
			rm.write("</div>");
		};

		/**
		 * Gets styles and classes which has to be applied to an item's wrapper element.
		 * @param {sap.ui.core.Control} oItem The grid item
		 * @param {sap.ui.core.Control} oControl The grid
		 * @returns {object} An object containing styles and classes
		 */
		GridContainerRenderer.getStylesForItemWrapper = function(oItem, oControl) {
			var mStyles = new Map(),
				aClasses = ["sapFGridContainerItemWrapper"];

			var oLayoutData = oItem.getLayoutData();
			if (oLayoutData) {
				var iItemColumns = oLayoutData.getColumns(),
					iTotalColumns = oControl.getActiveLayoutSettings().getColumns();

				if (iItemColumns && iTotalColumns) {
					// do not allow items to have more columns than total columns, else the layout brakes
					iItemColumns = Math.min(iItemColumns, iTotalColumns);
				}

				if (iItemColumns) {
					mStyles.set("grid-column", "span " + iItemColumns);
				}

				if (oControl.getInlineBlockLayout()) {
					mStyles.set("grid-row", "span 1");
				} else if (oLayoutData.getRows() || oLayoutData.getMinRows()) {
					mStyles.set("grid-row", "span " + oLayoutData.getActualRows());
				}

				if (!oLayoutData.hasAutoHeight()) {
					aClasses.push("sapFGridContainerItemFixedRows");
				}
			}

			return {
				styles: mStyles,
				classes: aClasses
			};
		};

		return GridContainerRenderer;

	}, /* bExport= */ true);
