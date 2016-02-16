/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './FlexBoxStylingHelper'],
	function(jQuery, FlexBoxStylingHelper) {
	"use strict";

	// Issue warning if flex algorithm is unsupported
	if (!jQuery.support.flexBoxLayout && !jQuery.support.newFlexBoxLayout && !jQuery.support.ie10FlexBoxLayout) {
		jQuery.sap.log.warning("This browser does not support flexible box layouts natively.");
	}

	/**
	 * FlexBox renderer
	 * @namespace
	 */

	var FlexBoxRenderer = {};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	FlexBoxRenderer.render = function(oRm, oControl) {
		// Open FlexBox HTML element
		if (oControl.getRenderType() === sap.m.FlexRendertype.List) {
			oRm.write('<ul');
		} else {
			oRm.write('<div');
		}

		oRm.writeControlData(oControl);

		// Special treatment if FlexBox is itself an item of a parent FlexBox
		var oParent = oControl.getParent();
		if (oControl.getParent() instanceof sap.m.FlexBox) {
			oRm.addClass("sapMFlexItem");

			// Set layout properties for flex item
			var oLayoutData = oControl.getLayoutData();
			if (oLayoutData instanceof sap.m.FlexItemData) {
				FlexBoxStylingHelper.setFlexItemStyles(oRm, oLayoutData);
			}

			// Wrap in list item
			if (oParent.getRenderType() === sap.m.FlexRendertype.List) {
				oRm.write('<li');
			}
		} else if (oControl.getFitContainer()) {
			oRm.addClass("sapMFlexBoxFit");
		}

		// Add classes for flex styling
		oRm.addClass("sapMFlexBox");
		if (oControl.getDisplayInline()) {
			oRm.addClass("sapMFlexBoxInline");
		}

		if (oControl.getDirection() === sap.m.FlexDirection.Column || oControl.getDirection() === sap.m.FlexDirection.ColumnReverse) {
			oRm.addClass("sapMVBox");
		} else {
			oRm.addClass("sapMHBox");
		}

		if (oControl.getDirection() === sap.m.FlexDirection.RowReverse || oControl.getDirection() === sap.m.FlexDirection.ColumnReverse) {
			oRm.addClass("sapMFlexBoxReverse");
		}

		oRm.addClass("sapMFlexBoxJustify" + oControl.getJustifyContent());
		oRm.addClass("sapMFlexBoxAlignItems" + oControl.getAlignItems());
		oRm.addClass("sapMFlexBoxWrap" + oControl.getWrap());
		oRm.addClass("sapMFlexBoxAlignContent" + oControl.getAlignContent());
		oRm.writeClasses();

		// Add inline styles
		if (oControl.getHeight()) {
			oRm.addStyle("height", oControl.getHeight());
		}
		if (oControl.getWidth()) {
			oRm.addStyle("width", oControl.getWidth());
		}
		oRm.writeStyles();

		// Add tooltip
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		// Close opening tag
		oRm.write(">");

		// Render the flex items
		FlexBoxRenderer.renderItems(oControl, oRm);

		// Close FlexBox HTML element
		if (oControl.getRenderType() === sap.m.FlexRendertype.List) {
			oRm.write("</ul>");
		} else {
			oRm.write("</div>");
		}
	};

	FlexBoxRenderer.renderItems = function(oControl, oRm) {
		var aChildren = oControl.getItems(),
			sWrapperTag = '';

		for (var i = 0; i < aChildren.length; i++) {
			// Don't wrap if it's a FlexBox control
			if (aChildren[i] instanceof sap.m.FlexBox) {
				sWrapperTag = "";
			} else if (oControl.getRenderType() === sap.m.FlexRendertype.List) {
				sWrapperTag = "li";
			} else {
				sWrapperTag = "div";
			}

			FlexBoxRenderer.renderItem(aChildren[i], sWrapperTag, oRm);
		}
	};

	FlexBoxRenderer.renderItem = function(oItem, sWrapperTag, oRm) {
		if (sWrapperTag) {
			// Open wrapper
			oRm.write('<' + sWrapperTag);

			// Set layout properties
			var oLayoutData = oItem.getLayoutData();

			if (oLayoutData instanceof sap.m.FlexItemData) {
				// FlexItemData is an element not a control, so we need to write id and style class ourselves
				if (oLayoutData.getId()) {
					oRm.writeAttributeEscaped("id", oLayoutData.getId());
				}
				if (oLayoutData.getStyleClass()) {
					oRm.addClass(jQuery.sap.encodeHTML(oLayoutData.getStyleClass()));
				}

				oRm.addClass("sapMFlexItemAlign" + oLayoutData.getAlignSelf());

				// Set layout properties for flex item
				FlexBoxStylingHelper.setFlexItemStyles(oRm, oLayoutData);
				oRm.writeStyles();

				// ScrollContainer needs height:100% on the flex item
				if (oItem instanceof sap.m.ScrollContainer) {
					oRm.addClass("sapMFlexBoxFit");
				}

				// Hide invisible items, but leave them in the DOM
				if (!oItem.getVisible()) {
					oRm.addClass("sapUiHiddenPlaceholder");
				}
			}

			oRm.addClass("sapMFlexItem");
			oRm.writeClasses();
			oRm.write(">");
		}

		// Render control
		oRm.renderControl(oItem);

		if (sWrapperTag) {
			// Close wrapper
			oRm.write('</' + sWrapperTag + '>');
		}
	};

	return FlexBoxRenderer;

}, /* bExport= */ true);