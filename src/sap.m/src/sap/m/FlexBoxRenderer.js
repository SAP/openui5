/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './FlexBoxStylingHelper', 'sap/m/library'],
	function(jQuery, FlexBoxStylingHelper, library) {
	"use strict";

	// shortcut for sap.m.FlexDirection
	var FlexDirection = library.FlexDirection;

	// shortcut for sap.m.FlexRendertype
	var FlexRendertype = library.FlexRendertype;

	// Issue warning if flex algorithm is unsupported
	if (!jQuery.support.flexBoxLayout && !jQuery.support.newFlexBoxLayout && !jQuery.support.ie10FlexBoxLayout) {
		jQuery.sap.log.warning("This browser does not support flexible box layouts natively.");
	}


	var lazyInstanceof = function(oControl, sModule) {
		var FNClass = sap.ui.require(sModule);
		return typeof FNClass === 'function' && (oControl instanceof FNClass);
	};
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
		if (oControl.getRenderType() === FlexRendertype.List) {
			oRm.write('<ul');
		} else {
			oRm.write('<div');
		}

		oRm.writeControlData(oControl);

		// Special treatment if FlexBox is itself an item of a parent FlexBox
		var oParent = oControl.getParent();
		if (lazyInstanceof(oControl.getParent(), "sap/m/FlexBox")) {
			oRm.addClass("sapMFlexItem");

			// Set layout properties for flex item
			var oLayoutData = oControl.getLayoutData();
			if (oLayoutData instanceof sap.m.FlexItemData) {
				FlexBoxStylingHelper.setFlexItemStyles(oRm, oLayoutData);
			}

			// Wrap in list item
			if (oParent.getRenderType() === FlexRendertype.List) {
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

		if (oControl.getDirection() === FlexDirection.Column || oControl.getDirection() === FlexDirection.ColumnReverse) {
			oRm.addClass("sapMVBox");
		} else {
			oRm.addClass("sapMHBox");
		}

		if (oControl.getDirection() === FlexDirection.RowReverse || oControl.getDirection() === FlexDirection.ColumnReverse) {
			oRm.addClass("sapMFlexBoxReverse");
		}

		oRm.addClass("sapMFlexBoxJustify" + oControl.getJustifyContent());
		oRm.addClass("sapMFlexBoxAlignItems" + oControl.getAlignItems());
		oRm.addClass("sapMFlexBoxWrap" + oControl.getWrap());
		oRm.addClass("sapMFlexBoxAlignContent" + oControl.getAlignContent());
		oRm.addClass("sapMFlexBoxBG" + oControl.getBackgroundDesign());
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
		if (oControl.getRenderType() === FlexRendertype.List) {
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
			if (lazyInstanceof(aChildren[i], 'sap/m/FlexBox') || oControl.getRenderType() === FlexRendertype.Bare) {
				sWrapperTag = "";
			} else if (oControl.getRenderType() === FlexRendertype.List) {
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

			// ScrollContainer needs height:100% on the flex item
			if (oItem instanceof sap.m.ScrollContainer) {
				oRm.addClass("sapMFlexBoxScroll");
			}

			// Hide invisible items, but leave them in the DOM
			if (!oItem.getVisible()) {
				oRm.addClass("sapUiHiddenPlaceholder");
			}
		}

		// Set layout properties
		var oLayoutData = oItem.getLayoutData();

		// If no layout data is set, create it so that an ID can be set on the wrapper
		if (sWrapperTag && !oLayoutData) {
			oItem.setAggregation("layoutData", new sap.m.FlexItemData(), true);
			oLayoutData = oItem.getLayoutData();
		}

		if (!(oLayoutData instanceof sap.m.FlexItemData)) {
			jQuery.sap.log.warning(oLayoutData + " set on " + oItem + " is not of type sap.m.FlexItemData");
		} else {
			// FlexItemData is an element not a control, so we need to write id and style class ourselves if a wrapper tag is used
			if (sWrapperTag && oLayoutData.getId()) {
				oRm.writeAttributeEscaped("id", oLayoutData.getId());
			}

			// Add style class set by app
			if (oLayoutData.getStyleClass()) {
				FlexBoxRenderer.addItemClass(jQuery.sap.encodeHTML(oLayoutData.getStyleClass()), oItem, sWrapperTag, oRm);
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

		// Write the styles and classes and close the wrapper tag
		if (sWrapperTag) {
			oRm.writeStyles();
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

	FlexBoxRenderer.addItemClass = function(sClass, oItem, sWrapperTag, oRm) {
		if (sWrapperTag) {
			oRm.addClass(sClass);
		} else {
			oItem.addStyleClass(sClass);
		}
	};

	return FlexBoxRenderer;

}, /* bExport= */ true);