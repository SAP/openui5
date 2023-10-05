/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	'sap/ui/core/InvisibleText',
	'sap/ui/core/Core',
	"sap/ui/core/Lib"
], function(InvisibleText, Core, Lib) {
	"use strict";

	/**
	 * A helper module containing general overwrite methods applicable for all input elements
	 */
	var InputsOverwrites = {};

	/**
	 * Overwrites handling of required input elements
	 *
	 * @param {object} oAdaptiveCardElement The adaptive cards input element
	 */
	InputsOverwrites.overwriteRequired = function (oAdaptiveCardElement) {
		var sContainerRole = oAdaptiveCardElement._renderedInputControlElement.getAttribute("role");

		// if the container is a radiogroup, aria-required is valid and no overwrites are needed
		if (sContainerRole === "radiogroup") {
			return;
		}

		oAdaptiveCardElement.renderedInputControlElement.removeAttribute('aria-required');

		// if there is no role on the container, the element is a single input field and required attribute should be set to the web component element
		if (!sContainerRole) {
			oAdaptiveCardElement.renderedInputControlElement.required = oAdaptiveCardElement.isRequired;
			return;
		}

		// for ChoiseSet with checkboxes, we should add a descriptive text, since aria-required is not a valid attribute for role="group"
		if (sContainerRole === "group" && oAdaptiveCardElement.isRequired) {
			var sInvisibleTextId = new InvisibleText({
				id: oAdaptiveCardElement._renderedInputControlElement.id + "-InvisibleText",
				text: Lib.getResourceBundleFor("sap.ui.integration").getText("ADAPTIVE_CARDS_REQUIRED_FIELD")
			}).toStatic().getId();

			oAdaptiveCardElement.renderedInputControlElement.setAttribute("aria-describedby", sInvisibleTextId);
		}
	};

	/**
	 * Overwrites handling of labelling
	 *
	 * @param {object} oAdaptiveCardElement The adaptive cards input element
	 */
	InputsOverwrites.overwriteLabel = function (oAdaptiveCardElement) {
		if (!oAdaptiveCardElement._renderedLabelElement) {
			return;
		}

		var oLabel = document.createElement("ui5-label");

		oLabel.id = oAdaptiveCardElement._renderedLabelElement.id;
		oLabel.innerText = oAdaptiveCardElement.label;
		oLabel.for = oAdaptiveCardElement._renderedInputControlElement.id;
		oLabel.required = oAdaptiveCardElement.isRequired;

		// styles originally applied to the adaptive cards native label, should be added to the ui5-label
		oLabel.style.marginBottom = oAdaptiveCardElement.hostConfig.getEffectiveSpacing(oAdaptiveCardElement.hostConfig.inputs.label.inputSpacing) + "px";

		// remove the native label DOM element and set the ui5-label
		oAdaptiveCardElement._renderedLabelElement.remove();
		oAdaptiveCardElement._renderedLabelElement = oLabel;
		oAdaptiveCardElement._outerContainerElement.insertBefore(oAdaptiveCardElement._renderedLabelElement, oAdaptiveCardElement.inputControlContainerElement);
	};

	/**
	 * Overwrite handling of accessible name
	 *
	 * @param {object} oAdaptiveCardElement The adaptive cards input element
	 * @param {string} sAttribute The attribute, which should be set
	 */
	InputsOverwrites.overwriteAriaLabelling = function (oAdaptiveCardElement, sAttribute) {
		if (!oAdaptiveCardElement._renderedInputControlElement) {
			return;
		}

		if (oAdaptiveCardElement._renderedLabelElement) {
			oAdaptiveCardElement._renderedInputControlElement.setAttribute(sAttribute, oAdaptiveCardElement._renderedLabelElement.id);
		} else {
			oAdaptiveCardElement._renderedInputControlElement.removeAttribute(sAttribute);
		}
	};

	/**
	 * Creates the value state message slot
	 *
	 * @param {object} oAdaptiveCardElement The adaptive cards input element
	 * @param {string} oElement The HTML element on which to set the slot
	 */
	InputsOverwrites.createValueStateElement = function(oAdaptiveCardElement, oElement) {
		if (!oAdaptiveCardElement.errorMessage) {
			return;
		}

		var oValueStateMessage = document.createElement("div");
		oValueStateMessage.setAttribute("slot", "valueStateMessage");
		oValueStateMessage.innerText = oAdaptiveCardElement.errorMessage;
		oElement.appendChild(oValueStateMessage);
	};

	return InputsOverwrites;
});