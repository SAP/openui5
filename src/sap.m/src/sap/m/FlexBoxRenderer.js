/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './FlexBoxStylingHelper'],
	function(jQuery, FlexBoxStylingHelper) {
	"use strict";


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
		if (!jQuery.support.flexBoxLayout && !jQuery.support.newFlexBoxLayout && !jQuery.support.ie10FlexBoxLayout) {
			jQuery.sap.log.warning("This browser does not support Flexible Box Layouts natively.");
			FlexBoxRenderer.usePolyfill = true;
		}
	
		// Make sure HBox and VBox don't get the wrong direction and get the appropriate class
		var hvClass = "";
		if (oControl.getDirection() === "Row" || oControl.getDirection() === "RowReverse") {
			if (oControl instanceof sap.m.VBox) {
				jQuery.sap.log.error("Flex direction cannot be set to Row or RowReverse on VBox controls.");
			} else {
				hvClass = "sapMHBox";
			}
		} else if (oControl.getDirection() === "Column" || oControl.getDirection() === "ColumnReverse") {
			if (oControl instanceof sap.m.HBox) {
				jQuery.sap.log.error("Flex direction cannot be set to Column or ColumnReverse on HBox controls.");
			} else {
				hvClass = "sapMVBox";
			}
		}
	
		// Special treatment if FlexBox is itself an item of a parent FlexBox
		var oParent = oControl.getParent();
		if (oControl.getParent() instanceof sap.m.FlexBox) {
			oRm.addClass("sapMFlexItem");
	
	
			// Set layout properties
			var oLayoutData = oControl.getLayoutData();
			if (oLayoutData instanceof sap.m.FlexItemData && !FlexBoxRenderer.usePolyfill) {
				FlexBoxStylingHelper.setFlexItemStyles(oRm, oLayoutData);
			}
	
			if (oParent.getRenderType() === 'List') {
				oRm.write('<li');
				oRm.writeClasses();
				oRm.writeStyles();
			}
		}
	
		if (oControl.getRenderType() === 'List') {
			oRm.write('<ul');
		} else {
			oRm.write('<div');
		}
	
		oRm.writeControlData(oControl);
		oRm.addClass("sapMFlexBox");
		oRm.addClass(hvClass);
		oRm.writeClasses();
		if (oControl.getWidth()) {
			oRm.addStyle("width", oControl.getWidth());
		}
		if (oControl.getHeight()) {
			oRm.addStyle("height", oControl.getHeight());
		}
		if (!FlexBoxRenderer.usePolyfill) {
			FlexBoxStylingHelper.setFlexBoxStyles(oRm, oControl);
		}
		oRm.writeStyles();
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.write(">");
	
		// Now render the flex items
		var aChildren = oControl.getItems();
		var bWrapItem = true;
		for (var i = 0; i < aChildren.length; i++) {
			// Don't wrap if it's a FlexBox control or if it's not visible
			if (aChildren[i] instanceof sap.m.FlexBox || (aChildren[i].getVisible !== undefined && !aChildren[i].getVisible())) {
				bWrapItem = false;
			} else {
				bWrapItem = true;
			}
	
			// Create wrapper if it's not a FlexBox control
			if (bWrapItem) {
				if (oControl.getRenderType() === 'List') {
					oRm.write('<li');
				} else {
					oRm.write('<div');
				}
	
				// Set layout properties
				var oLayoutData = aChildren[i].getLayoutData();
				if (oLayoutData instanceof sap.m.FlexItemData) {
					if (oLayoutData.getId()) {
						oRm.write(" id='" + oLayoutData.getId() + "'");
					}
					if (oLayoutData.getStyleClass()) {
						oRm.addClass(jQuery.sap.encodeHTML(oLayoutData.getStyleClass()));
					}
	
					if (!FlexBoxRenderer.usePolyfill) {
						FlexBoxStylingHelper.setFlexItemStyles(oRm, oLayoutData);
					}
	
					// ScrollContainer needs height:100% on the flex item
					if (aChildren[i] instanceof sap.m.ScrollContainer) {
						oRm.addStyle("height", "100%");
					}
					oRm.writeStyles();
				}
	
				oRm.addClass("sapMFlexItem");
				oRm.writeClasses();
				oRm.write(">");
			}
	
			// Render control
			oRm.renderControl(aChildren[i]);
	
			if (bWrapItem) {
				// Close wrapper
				if (oControl.getRenderType() === 'List') {
					oRm.write('</li>');
				} else {
					oRm.write('</div>');
				}
			}
		}
	
		// Close the flexbox
		if (oControl.getRenderType() === "List") {
			oRm.write("</ul>");
		} else {
			oRm.write("</div>");
		}
	};

	return FlexBoxRenderer;

}, /* bExport= */ true);
