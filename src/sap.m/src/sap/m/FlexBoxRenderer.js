/*!
 * ${copyright}
 */

sap.ui.define([
	'./FlexBoxStylingHelper',
	'sap/m/library',
	"sap/base/Log",
	"sap/m/FlexItemData"
],
	function(FlexBoxStylingHelper, library, Log, FlexItemData) {
	"use strict";

	// shortcut for sap.m.FlexDirection
	var FlexDirection = library.FlexDirection;

	// shortcut for sap.m.FlexRendertype
	var FlexRendertype = library.FlexRendertype;

	/**
	 * FlexBox renderer
	 * @namespace
	 */

	var FlexBoxRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.FlexBox} oFlexBox an object representation of the control that should be rendered
	 */
	FlexBoxRenderer.render = function(oRm, oFlexBox) {
		// Open FlexBox HTML element
		oRm.openStart(oFlexBox.getRenderType() === FlexRendertype.List ? "ul" : "div", oFlexBox);

		// Special treatment if FlexBox is itself an item of a parent FlexBox
		var oParent = oFlexBox.getParent();
		if (oParent && oParent.isA("sap.m.FlexBox")) {
			if (!oFlexBox.hasStyleClass("sapMFlexItem")) {
				oRm.class("sapMFlexItem");
			}

			// Set layout properties for flex item
			var oLayoutData = oFlexBox.getLayoutData();
			if (oLayoutData instanceof FlexItemData) {
				FlexBoxStylingHelper.setFlexItemStyles(oRm, oLayoutData);
			}
		} else if (oFlexBox.getFitContainer()) {
			oRm.class("sapMFlexBoxFit");
		}

		// Add classes for flex styling
		oRm.class("sapMFlexBox");
		if (oFlexBox.getDisplayInline()) {
			oRm.class("sapMFlexBoxInline");
		}

		if (oFlexBox.getDirection() === FlexDirection.Column || oFlexBox.getDirection() === FlexDirection.ColumnReverse) {
			oRm.class("sapMVBox");
		} else {
			oRm.class("sapMHBox");
		}

		if (oFlexBox.getDirection() === FlexDirection.RowReverse || oFlexBox.getDirection() === FlexDirection.ColumnReverse) {
			oRm.class("sapMFlexBoxReverse");
		}

		oRm.class("sapMFlexBoxJustify" + oFlexBox.getJustifyContent());
		oRm.class("sapMFlexBoxAlignItems" + oFlexBox.getAlignItems());
		oRm.class("sapMFlexBoxWrap" + oFlexBox.getWrap());
		oRm.class("sapMFlexBoxAlignContent" + oFlexBox.getAlignContent());

		var sBGClass = "sapMFlexBoxBG" + oFlexBox.getBackgroundDesign();

		if (!oFlexBox.hasStyleClass(sBGClass)) {
			oRm.class(sBGClass);
		}

		// Add inline styles
		oRm.style("height", oFlexBox.getHeight());
		oRm.style("width", oFlexBox.getWidth());

		// Add tooltip
		var sTooltip = oFlexBox.getTooltip_AsString();
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		// Close opening tag
		oRm.openEnd();

		// Render the flex items
		FlexBoxRenderer.renderItems(oFlexBox, oRm);

		// Close FlexBox HTML element
		if (oFlexBox.getRenderType() === FlexRendertype.List) {
			oRm.close("ul");
		} else {
			oRm.close("div");
		}
	};

	FlexBoxRenderer.renderItems = function(oFlexBox, oRm) {
		var aChildren = oFlexBox.getItems(),
			sWrapperTag = '';

		for (var i = 0; i < aChildren.length; i++) {
			// Don't wrap if it's a FlexBox control
			if (aChildren[i].isA('sap.m.FlexBox') || oFlexBox.getRenderType() === FlexRendertype.Bare) {
				sWrapperTag = "";
			} else if (oFlexBox.getRenderType() === FlexRendertype.List) {
				sWrapperTag = "li";
			} else {
				sWrapperTag = "div";
			}

			FlexBoxRenderer.renderItem(aChildren[i], sWrapperTag, oRm);
		}
	};

	FlexBoxRenderer.renderItem = function(oItem, sWrapperTag, oRm) {

		// Set layout properties
		var oLayoutData = oItem.getLayoutData();

		// If no layout data is set, create it so that an ID can be set on the wrapper
		if (sWrapperTag && !oLayoutData) {
			oItem.setAggregation("layoutData", new FlexItemData(), true);
			oLayoutData = oItem.getLayoutData();
		}

		if (!(oLayoutData instanceof FlexItemData)) {
			if (oLayoutData) {
				Log.warning(oLayoutData + " set on " + oItem + " is not of type sap.m.FlexItemData");
			}
			if (sWrapperTag) {
				// Open wrapper
				oRm.openStart(sWrapperTag);
			}
		} else {
			// FlexItemData is an element not a control, so we need to write id and style class ourselves if a wrapper tag is used
			if (sWrapperTag) {
				oRm.openStart(sWrapperTag, oLayoutData.getId());
			}

			// Add style class set by app
			if (oLayoutData.getStyleClass()) {
				FlexBoxRenderer.addItemClass(oLayoutData.getStyleClass(), oItem, sWrapperTag, oRm);
			}

			// Add classes relevant for flex item
			FlexBoxRenderer.addItemClass("sapMFlexItemAlign" + oLayoutData.getAlignSelf(), oItem, sWrapperTag, oRm);
			FlexBoxRenderer.addItemClass("sapMFlexBoxBG" + oLayoutData.getBackgroundDesign(), oItem, sWrapperTag, oRm);

			// Set layout properties for flex item
			if (sWrapperTag) {
				FlexBoxStylingHelper.setFlexItemStyles(oRm, oLayoutData);
			}
		}

		FlexBoxRenderer.addItemClass("sapMFlexItem", oItem, sWrapperTag, oRm);

		// Write the styles and classes and end the opening wrapper tag
		if (sWrapperTag) {

			// ScrollContainer needs height:100% on the flex item
			if (oItem.isA("sap.m.ScrollContainer")) {
				oRm.class("sapMFlexBoxScroll");
			}

			// Hide invisible items, but leave them in the DOM
			if (!oItem.getVisible()) {
				oRm.class("sapUiHiddenPlaceholder");
			}

			oRm.openEnd();
		}

		// Render control
		oRm.renderControl(oItem);

		if (sWrapperTag) {
			// Close wrapper
			oRm.close(sWrapperTag);
		}
	};

	FlexBoxRenderer.addItemClass = function(sClass, oItem, sWrapperTag, oRm) {
		if (sWrapperTag) {
			oRm.class(sClass);
		} else {
			oItem.addStyleClass(sClass);
		}
	};

	return FlexBoxRenderer;

}, /* bExport= */ true);