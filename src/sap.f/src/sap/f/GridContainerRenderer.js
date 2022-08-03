/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";
	/*global Map */

	/**
	 * GridContainer renderer
	 * @namespace
	 */
	var GridContainerRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.GridContainer} oControl an object representation of the control that should be rendered
	 */
	GridContainerRenderer.render = function (oRM, oControl) {
		var sId = oControl.getId(),
			aItems = oControl.getItems(),
			sTooltip = oControl.getTooltip_AsString();

		oRM.openStart("div", oControl).class("sapFGridContainer");

		this.setGridStyles(oRM, oControl._getActiveGridStyles());

		oRM.accessibilityState(oControl, {
			role: "list",
			roledescription: oControl._oRb.getText("GRIDCONTAINER_ROLEDESCRIPTION")
		});

		if (oControl.getSnapToRow()) {
			oRM.class("sapFGridContainerSnapToRow");
		}

		if (oControl.getAllowDenseFill()) {
			oRM.class("sapFGridContainerDenseFill");
		}

		if (oControl.getWidth()) {
			oRM.style("width", oControl.getWidth());
		}

		if (oControl.getMinHeight()) {
			oRM.style("min-height", oControl.getMinHeight());
		}

		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		oRM.openEnd();

		this.renderDummyArea(oRM, sId, "before", -1);

		aItems.forEach(function (oItem, iIndex) {
			this.renderItem(oRM, oItem, oControl, iIndex);
		}.bind(this));

		this.renderDummyArea(oRM, sId, "after", 0);

		oRM.close("div");
	};

	/**
	 * Adds grid styles depending on the layout settings
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {object} mStyles The current grid related CSS styles
	 */
	GridContainerRenderer.setGridStyles = function (oRM, mStyles) {
		for (var sName in mStyles) {
			oRM.style(sName, mStyles[sName]);
		}
	};

	/**
	 * Renders a single item in the grid.
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oItem The grid item
	 * @param {sap.f.GridContainer} oControl The control
	 * @param {int} iIndex The index of the grid item
	 */
	GridContainerRenderer.renderItem = function (oRM, oItem, oControl, iIndex) {
		var mStylesInfo = this.getStylesForItemWrapper(oItem, oControl),
			mStyles = mStylesInfo.styles,
			aClasses = mStylesInfo.classes,
			mAccState = {
				role: "listitem",
				labelledby: oItem.getId()
			};

		if (oItem.getAriaRoleDescription) {
			mAccState.roledescription = oItem.getAriaRoleDescription();
		}

		oRM.openStart("div", oControl.getId() + "-item-" + iIndex)
			.attr("tabindex", "0")
			.accessibilityState(oControl, mAccState);

		mStyles.forEach(function (sValue, sKey) {
			oRM.style(sKey, sValue);
		});

		aClasses.forEach(function (sValue) {
			oRM.class(sValue);
		});

		oRM.openEnd();

		oRM.renderControl(oItem);

		oRM.close("div");
	};

	/**
	 * Gets styles and classes which has to be applied to an item's wrapper element.
	 * @param {sap.ui.core.Control} oItem The grid item
	 * @param {sap.f.GridContainer} oControl The grid
	 * @returns {object} An object containing styles and classes
	 */
	GridContainerRenderer.getStylesForItemWrapper = function (oItem, oControl) {
		var mStyles = new Map(),
			aClasses = ["sapFGridContainerItemWrapper"],
			oLayoutData = oItem.getLayoutData(),
			iItemColumns,
			iTotalColumns;

		if (oLayoutData) {
			iItemColumns = oLayoutData.getColumns();
			iTotalColumns = oControl.getActiveLayoutSettings().getColumns();

			if (iItemColumns && iTotalColumns) {
				// do not allow items to have more columns than total columns, else the layout breaks
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

		if (!oItem.getVisible()) {
			aClasses.push("sapFGridContainerInvisiblePlaceholder");
		}

		return {
			styles: mStyles,
			classes: aClasses
		};
	};

	/**
	 * Renders a dummy area for keyboard handling purposes
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {string} sControlId the ID of the control
	 * @param {string} sAreaId the ID of the dummy area (either, "before" or "after")
	 * @param {int} iTabIndex the tabindex of the dummy area
	 */
	GridContainerRenderer.renderDummyArea = function (oRM, sControlId, sAreaId, iTabIndex) {
		oRM.openStart("div", sControlId + "-" + sAreaId)
			.class("sapFGridContainerDummyArea")
			.attr("tabindex", iTabIndex)
			.openEnd()
			.close("div");
	};

	return GridContainerRenderer;
}, /* bExport= */ true);