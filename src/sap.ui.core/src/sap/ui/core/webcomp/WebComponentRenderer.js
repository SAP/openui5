/*!
 * ${copyright}
 */

// Provides default renderer for all web components
sap.ui.define([
		"sap/base/strings/hyphenate"
	],
	function(hyphenate) {
		"use strict";

		/**
		 * WebComponent renderer.
		 * @namespace
		 */
		var WebComponentRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oWebComponent an object representation of the control that should be rendered
		 */
		WebComponentRenderer.render = function(oRm, oWebComponent){
			var sTag = oWebComponent.getMetadata().getTag();

			// Opening custom element tag
			oRm.openStart(sTag, oWebComponent);

			// Properties with mapping="attribute"
			this.renderAttributeProperties(oRm, oWebComponent);
			// Properties with mapping="style"
			this.renderStyleProperties(oRm, oWebComponent);
			// Additional attributes/classes/styles
			this.customRenderInOpeningTag(oRm, oWebComponent);

			oRm.openEnd();

			// Properties with mapping="textContent"
			this.renderTextContentProperties(oRm, oWebComponent);
			// Properties with mapping="slot"
			this.renderSlotProperties(oRm, oWebComponent);
			// Aggregations
			this.renderAggregations(oRm, oWebComponent);
			// Additional children
			this.customRenderInsideTag(oRm, oWebComponent);

			// Closing custom element tag
			oRm.close(sTag);
		};

		WebComponentRenderer.renderAttributeProperties = function(oRm, oWebComponent) {
			var oAttrProperties = oWebComponent.getMetadata().getPropertiesByMapping("attribute");
			for (var sPropName in oAttrProperties) {
				var oPropData = oAttrProperties[sPropName];
				var sAttrName = oPropData._sMapTo ? oPropData._sMapTo : hyphenate(sPropName);
				var vPropValue = oPropData.get(oWebComponent);
				if (oPropData._fnMappingFormatter) {
					vPropValue = oWebComponent[oPropData._fnMappingFormatter].call(oWebComponent, vPropValue);
				}

				if (oPropData.type === "boolean") {
					if (vPropValue) {
						oRm.attr(sAttrName, "");
					}
				} else {
					if (vPropValue != null) {
						oRm.attr(sAttrName, vPropValue);
					}
				}
			}
		};

		WebComponentRenderer.renderStyleProperties = function(oRm, oWebComponent) {
			var oStyleProperties = oWebComponent.getMetadata().getPropertiesByMapping("style");
			for (var sPropName in oStyleProperties) {
				var oPropData = oStyleProperties[sPropName];
				var sStyleName = oPropData._sMapTo ? oPropData._sMapTo : hyphenate(sPropName);
				var vPropValue = oPropData.get(oWebComponent);
				if (oPropData._fnMappingFormatter) {
					vPropValue = oWebComponent[oPropData._fnMappingFormatter].call(oWebComponent, vPropValue);
				}

				if (vPropValue != null) {
					oRm.style(sStyleName, vPropValue);
				}
			}
		};

		WebComponentRenderer.renderTextContentProperties = function(oRm, oWebComponent) {
			var oTextContentProperties = oWebComponent.getMetadata().getPropertiesByMapping("textContent");
			for (var sPropName in oTextContentProperties) {
				var oPropData = oTextContentProperties[sPropName];
				var vPropValue = oPropData.get(oWebComponent);
				if (oPropData._fnMappingFormatter) {
					vPropValue = oWebComponent[oPropData._fnMappingFormatter].call(oWebComponent, vPropValue);
				}

				oRm.text(vPropValue);
			}
		};

		WebComponentRenderer.renderSlotProperties = function(oRm, oWebComponent) {
			var oSlotProperties = oWebComponent.getMetadata().getPropertiesByMapping("slot");
			for (var sPropName in oSlotProperties) {
				var oPropData = oSlotProperties[sPropName];
				var vPropValue = oPropData.get(oWebComponent);
				if (oPropData._fnMappingFormatter) {
					vPropValue = oWebComponent[oPropData._fnMappingFormatter].call(oWebComponent, vPropValue);
				}
				var sTag = oPropData._sMapTo ? oPropData._sMapTo : "span";

				if (vPropValue) {
					oRm.openStart(sTag);
					oRm.attr("slot", sPropName);
					oRm.openEnd();
					oRm.text(vPropValue);
					oRm.close(sTag);
				}
			}
		};

		WebComponentRenderer.renderAggregations = function(oRm, oWebComponent) {
			var oAggregations = oWebComponent.getMetadata().getAllAggregations();
			for (var sAggName in oAggregations) {
				var aggData = oAggregations[sAggName];
				var aggValue = aggData.get(oWebComponent);

				if (aggData.multiple) {
					aggValue.forEach(oRm.renderControl, oRm);
				} else {
					if (aggValue) {
						oRm.renderControl(aggValue);
					}
				}
			}
		};

		WebComponentRenderer.customRenderInOpeningTag = function(oRm, oWebComponent) {};

		WebComponentRenderer.customRenderInsideTag = function(oRm, oWebComponent) {};

		return WebComponentRenderer;

	});
