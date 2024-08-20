/*!
 * ${copyright}
 */

// Provides default renderer for all web components
sap.ui.define([
	"../Element",
	"../Control",
	"sap/base/strings/hyphenate"
],
function(Element, Control, hyphenate) {
	"use strict";

	/**
	 * WebComponent renderer.
	 *
	 * @namespace
	 * @alias sap.ui.core.webc.WebComponentRenderer
	 * @static
	 * @experimental Since 1.118.0 The API might change. It is not intended for productive usage yet!
	 */
	var WebComponentRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.webc.WebComponent} oWebComponent an object representation of the control that should be rendered
	 */
	WebComponentRenderer.render = function(oRm, oWebComponent){
		var sTag = oWebComponent.getMetadata().getTag();

		// Opening custom element tag
		oRm.openStart(sTag, oWebComponent);

		// Properties with mapping="property"
		this.renderAttributeProperties(oRm, oWebComponent);
		// Properties with mapping="style"
		this.renderStyleProperties(oRm, oWebComponent);
		// Properties, managed by associations
		this.renderAssociationProperties(oRm, oWebComponent);
		// Tooltip aggregation
		this.renderTooltipAggregation(oRm, oWebComponent);
		// Hook for customization
		this.customRenderInOpeningTag(oRm, oWebComponent);
		// Attributes/Styles that the component sets internally
		this.preserveUnmanagedAttributes(oRm, oWebComponent);
		// Styles that the component sets internally
		this.preserveUnmanagedStyles(oRm, oWebComponent);

		oRm.openEnd();

		// Properties with mapping="textContent"
		this.renderTextContentProperties(oRm, oWebComponent);
		// Properties with mapping="slot"
		this.renderSlotProperties(oRm, oWebComponent);
		// Aggregations
		this.renderAggregations(oRm, oWebComponent);
		// Hook for customization (additional children)
		this.customRenderInsideTag(oRm, oWebComponent);

		// Closing custom element tag
		oRm.close(sTag);
	};

	/**
	 * Renders attributes, based on the control's properties
	 * @private
	 * @param oRm
	 * @param oWebComponent
	 */
	WebComponentRenderer.renderAttributeProperties = function(oRm, oWebComponent) {
		var oAttrProperties = oWebComponent.getMetadata().getPropertiesByMapping("property");

		var aPropsToAlwaysSet = ["enabled"].concat(Object.entries(oWebComponent.getMetadata().getPropertyDefaults()).map(([key, value]) => {
			return value !== undefined && value !== false ? key : null;
		})); // some properties can be initial and still have a non-default value due to side effects (e.g. EnabledPropagator)

		for (var sPropName in oAttrProperties) {
			var oPropData = oAttrProperties[sPropName];

			if (oWebComponent.isPropertyInitial(sPropName) && !aPropsToAlwaysSet.includes(sPropName)) {
				continue; // do not set attributes for properties that were not explicitly set or bound
			}

			var vPropValue = oPropData.get(oWebComponent);
			if (oPropData.type === "object" || typeof vPropValue === "object") {
				continue; // Properties of type "object" and custom-type properties with object values are set during onAfterRendering
			}

			var sAttrName = oPropData._sMapTo ? oPropData._sMapTo : hyphenate(sPropName);
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

	/**
	 * Preserves attributes that the component set on itself internally (such as private attributes and the attribute that mimics the tag, e.g. "ui5-button")
	 * This is necessary as otherwise Patcher.js will remove them upon each re-rendering
	 * @private
	 * @param oRm
	 * @param oWebComponent
	 */
	WebComponentRenderer.preserveUnmanagedAttributes = function(oRm, oWebComponent) {
		var oDomRef = oWebComponent.getDomRef();
		if (!oDomRef) {
			return; // First rendering - the unmanaged attributes haven't been set yet
		}

		var aAttributes = oDomRef.getAttributeNames();
		var aSkipList = ["id", "data-sap-ui", "style", "class", "__is-busy"];
		aAttributes.forEach(function(sAttr) {
			if (aSkipList.indexOf(sAttr) !== -1) {
				return; // Skip attributes, set by the framework
			}

			if (oWebComponent.getMetadata().isManagedAttribute(sAttr)) {
				return;
			}

			var sValue = oDomRef.getAttribute(sAttr); // Repeat the value from DOM
			if (sValue !== null) {
				oRm.attr(sAttr, sValue);
			}
		});
	};

	/**
	 * Preserves styles that the component set on itself internally (such as position top, left and CSS Variables)
	 * This is necessary as otherwise Patcher.js will remove them upon each re-rendering
	 * @private
	 * @param oRm
	 * @param oWebComponent
	 */
	WebComponentRenderer.preserveUnmanagedStyles = function(oRm, oWebComponent) {
		var oDomRef = oWebComponent.getDomRef();
		if (!oDomRef) {
			return; // First rendering - the unmanaged styles haven't been set yet
		}
		var aSetStyles = Array.prototype.slice.apply(oDomRef.style);
		if (aSetStyles.length === 0) {
			return; // No styles set at all
		}

		var oStyleProperties = oWebComponent.getMetadata().getPropertiesByMapping("style");
		var aManagedStyles = [];
		for (var sPropName in oStyleProperties) {
			var oPropData = oStyleProperties[sPropName];
			var sStyleName = oPropData._sMapTo ? oPropData._sMapTo : hyphenate(sPropName);
			aManagedStyles.push(sStyleName);
		}

		aSetStyles.forEach(function(sStyle) {
			if (aManagedStyles.indexOf(sStyle) !== -1) {
				return; // Do not preserve any managed styles
			}
			var sValue = sStyle.startsWith("--") ? window.getComputedStyle(oDomRef).getPropertyValue(sStyle) : oDomRef.style[sStyle]; // CSS Values can only be read from getComputedStyle
			oRm.style(sStyle, sValue);
		});
	};

	/**
	 * Renders styles, based on the control's properties
	 * @private
	 * @param oRm
	 * @param oWebComponent
	 */
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

	/**
	 * Renders properties, controlled by associations
	 * @private
	 * @param oRm
	 * @param oWebComponent
	 */
	WebComponentRenderer.renderAssociationProperties = function(oRm, oWebComponent) {
		var oAssociations = oWebComponent.getMetadata().getAssociationsWithMapping();
		for (var sAssocName in oAssociations) {
			var oAssocData = oAssociations[sAssocName];
			var vAssocValue = oAssocData.get(oWebComponent);
			var sAttrName = hyphenate(oAssocData._sMapTo); // The name of the attribute to be set with the association's ID value
			if (oAssocData._fnMappingFormatter) {
				vAssocValue = oWebComponent[oAssocData._fnMappingFormatter].call(oWebComponent, vAssocValue);
			}

			if (!oAssocData.multiple && vAssocValue && typeof vAssocValue === "object") {
				vAssocValue = vAssocValue.getId(); // The value will be the control ID, held by the association
			}

			if (vAssocValue) { // Only set the property, if the association is set
				oRm.attr(sAttrName, vAssocValue);
			}
		}
	};

	/**
	 * Transforms the tooltip aggregation to a tooltip attribute - components that support this attribute will use it
	 * @private
	 * @param oRm
	 * @param oWebComponent
	 */
	WebComponentRenderer.renderTooltipAggregation = function(oRm, oWebComponent) {
		var sTooltipText = oWebComponent.getTooltip_Text();
		if (sTooltipText) {
			oRm.attr("tooltip", sTooltipText);
		}
	};

	/**
	 * Renders text inside the component, if it has a property of type textContent
	 * Normally a single property of this type is expected (such as button text), but if more than one are set, they are all rendered
	 * @private
	 * @param oRm
	 * @param oWebComponent
	 */
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

	/**
	 * Renders properties as slotted text inside a div/span or another tag
	 * This is mostly useful for value state message as UI5 Web Components get the value state message as slotted text
	 * @private
	 * @param oRm
	 * @param oWebComponent
	 */
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

	/**
	 * Render children.
	 * Note: for each child, RenderManager.js will set the "slot" attribute automatically
	 * @private
	 * @param oRm
	 * @param oWebComponent
	 */
	WebComponentRenderer.renderAggregations = function(oRm, oWebComponent) {
		var oAggregations = oWebComponent.getMetadata().getAllAggregations();
		for (var sAggName in oAggregations) {
			if (Element.getMetadata().getAggregations().hasOwnProperty(sAggName) || Control.getMetadata().getAggregations().hasOwnProperty(sAggName)) {
				continue; // Skip aggregations, derived from Element.js / Control.js such as dependents and layoutData
			}

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

	/**
	 * Hook. For future use.
	 * @protected
	 * @param oRm
	 * @param oWebComponent
	 */
	WebComponentRenderer.customRenderInOpeningTag = function(oRm, oWebComponent) {};

	/**
	 * Hook. For future use.
	 * @param oRm
	 * @param oWebComponent
	 */
	WebComponentRenderer.customRenderInsideTag = function(oRm, oWebComponent) {};

	return WebComponentRenderer;

});