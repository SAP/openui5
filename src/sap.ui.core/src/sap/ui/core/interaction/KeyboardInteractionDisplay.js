/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/LanguageFallback",
	"sap/base/i18n/Localization",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/LabelEnablement",
	"sap/ui/core/Lib",
	"sap/ui/util/XMLHelper"
], function(Log, LanguageFallback, Localization, Device, Element, LabelEnablement, Library, XMLHelper) {
	"use strict";

	// Endpoints for sending messages
	const POST_MESSAGE_ENDPOINT_UPDATE = "sap.ui.interaction.UpdateDisplay";

	// Version number for the protocol
	const VERSION_NUMBER = "1.0.0";

	const oProtocol = {
		_version: VERSION_NUMBER,
		elements: [],
		docs: {}
	};

	// Cache to store loaded XML documents
	const oInteractionXMLCache = new Map();

	/**
	 * Retrieves the command information for a given control.
	 * @param  {sap.ui.core.Control} oControl The control to analyze.
	 * @return {Array} List of command information objects.
	 */
	const getCommandInfosFor = (oControl) => {
		const aCommandInfos = [];
		const aDependents = oControl.getDependents?.() || [];

		for (const oDependent of aDependents) {
			if (oDependent.isA("sap.ui.core.CommandExecution") && oDependent.getVisible()) {
				const oCommandInfo = oDependent._getCommandInfo();

				aCommandInfos.push({
					name: oDependent.getCommand(),
					kbd: Device.os.macintosh ? [oCommandInfo.shortcut.replace("Ctrl", "Cmd")] : [oCommandInfo.shortcut],
					description: oCommandInfo.description
				});
			}
		}
		return aCommandInfos;
	};

	/**
	 * Retrieves the label text for a given control.
	 * @param  {sap.ui.core.Control} oControl The control to analayze.
	 * @return {string} The label associated with the control.
	 */
	const getLabelFor = (oControl) => {
		const sDisplayControlId = oControl.getFieldHelpDisplay();
		const oLabelControl = sDisplayControlId
			? Element.getElementById(sDisplayControlId)
			: oControl;

		let sAccessibilityInfoLabel = null;

		const oAccessibilityInfo = oControl.getAccessibilityInfo?.();
		if (oAccessibilityInfo) {
			sAccessibilityInfoLabel = oAccessibilityInfo.description || oAccessibilityInfo.children?.[0]?.getAccessibilityInfo?.()?.description || null;
		}

		if (!sAccessibilityInfoLabel) {
			const ARIA_LABELLED_BY_SELECTOR = "[aria-labelledby]";
			const ARIA_LABELLED_BY_ATTR = "aria-labelledby";

			const oDomRef = oControl.getDomRef();

			let sAriaLabelledById = oDomRef.getAttribute(ARIA_LABELLED_BY_ATTR);
			if (!sAriaLabelledById) {
				const oFirstAriaLabelledBy = oDomRef.querySelector(ARIA_LABELLED_BY_SELECTOR);
				const activeElement = document.activeElement;

				if (oFirstAriaLabelledBy?.contains(activeElement)) {
					sAriaLabelledById = oFirstAriaLabelledBy.getAttribute(ARIA_LABELLED_BY_ATTR);
				}
			}

			sAccessibilityInfoLabel = sAriaLabelledById
				? document.getElementById(sAriaLabelledById)?.textContent
				: null;
		}

		return LabelEnablement._getLabelTexts(oLabelControl)[0] || sAccessibilityInfoLabel || oControl.getMetadata().getName();
	};

	/**
	 * Load and access interaction-documentation for library
	 * @param  {string} sLibrary The library to load the interaction document
	 * @return {null|XMLDocument} The library's interaction document or 'null'.
	 */
	const loadInteractionXMLFor = async (sLibrary) => {
		if (oInteractionXMLCache.has(sLibrary)) {
			return oInteractionXMLCache.get(sLibrary);
		}

		const sLanguage = Localization.getLanguage();
		const aFallbackChain = LanguageFallback.getFallbackLocales(sLanguage);
		let oInteractionXML = null;

		while (aFallbackChain.length) {
			const sLocale = aFallbackChain.shift();
			const sFileName = sLocale ? `interaction_${sLocale}.xml` : `interaction.xml`;
			const sResource = sap.ui.require.toUrl(`${sLibrary.replace(/\./g, "/")}/i18n/${sFileName}`);

			try {
				const oResponse = await fetch(sResource);
				if (!oResponse.ok) {
					const statusMessage = oResponse.statusText || `HTTP status ${oResponse.status}`;
					throw new Error(`Failed to load resource: ${sResource} - ${statusMessage}`);
				}
				const text = await oResponse.text();
				oInteractionXML = XMLHelper.parse(text);

				if (oInteractionXML) {
					// cache the loaded interaction document
					oInteractionXMLCache.set(sLibrary, oInteractionXML);
					break;
				}
			} catch (error) {
				Log.error(`Error loading interaction XML for library ${sLibrary}:`, error);
			}
		}

		return oInteractionXML;
	};

	/**
	 * Extracts interaction nodes from the given interaction document and retrieves "kbd" and "description" tags.
	 *
	 * @param  {string} sControlName The control name.
	 * @param  {XMLDocument} oInteractionXML The interaction document containing the interaction details.
	 * @return {Array} An array containing the control's interaction details, including "kbd" and "description".
	 */
	const getInteractions = (sControlName, oInteractionXML) => {
		const oInteractionDoc = oInteractionXML.documentElement;
		if (!oInteractionDoc) {
			return [];
		}

		const oControlNode = Array.from(oInteractionDoc.querySelectorAll(`control[name]`)).find((oNode) => {
			return oNode.getAttribute("name") === sControlName;
		});

		if (!oControlNode) {
			return [];
		}

		return Array.from(oInteractionDoc.querySelectorAll("interaction")).map((oInteractionNode) => ({
			kbd: Array.from(oInteractionNode.children).filter((child) => child.tagName === "kbd").map((kbd) => kbd.textContent.trim()),
			description: oInteractionNode.querySelector("description")?.innerHTML || ""
		}));
	};

	/**
	 * Retrieves the interaction documentation for the given control.
	 * @param  {sap.ui.core.Control} oControl The control to analyze.
	 * @return {Array} List of interaction documentation.
	 */
	const getInteractionDocFor = async (oControl) => {
		let sLibrary = null;
		let oCurrent = oControl;

		// Traverse up the control hierarchy to find the library name
		while (oCurrent && !sLibrary) {
			sLibrary = oCurrent.getMetadata().getLibraryName();
			oCurrent = oCurrent.getParent();
		}

		if (!sLibrary) {
			return [];
		}

		const oLibrary = Library._get(sLibrary);
		if (!oLibrary?.interactionDocumentation) {
			return [];
		}
		const oInteractionXML = await loadInteractionXMLFor(sLibrary);

		if (!oInteractionXML) {
			return [];
		}

		const sControlName = oControl.getMetadata().getName();
		return getInteractions(sControlName, oInteractionXML);
	};

	let oCurrentPort;
	let bThrottled = false;

	/**
	 * Initializes the keyboard interaction information gathering.
	 * @param  {Event} event The 'focusin' event triggering the initialization.
	 */
	const init = async (event) => {
		if (bThrottled) {
			return;
		}
		bThrottled = true;

		setTimeout(() => {
			bThrottled = false;
		}, 300);

		const aControlTree = [];
		const elements = [];
		const docs = {};
		const oTargetControl = Element.closestTo(event?.target || document.activeElement);

		if (!oTargetControl) {
			return;
		}

		// get generic key interactions from sap.ui.core
		const oCoreXML = await loadInteractionXMLFor("sap.ui.core");
		if (oCoreXML) {
			const oResourceBundle = Library.getResourceBundleFor("sap.ui.core");
			docs["sap.ui.core.Control"] = {
				"interactions": getInteractions("sap.ui.core.Control", oCoreXML)
			};
			elements.push({
				"class": "sap.ui.core.Control",
				"label": oResourceBundle.getText("Generic.Keyboard.Interaction.Text"),
				"interactions": [{
					"$ref": `docs/sap.ui.core.Control/interactions`
				}]
			});
		}

		let oCurrent = oTargetControl;
		while (oCurrent) {
			aControlTree.push(oCurrent);
			oCurrent = oCurrent.getParent();
		}

		for (let i = 0; i < aControlTree.length; i++) {
			const oControl = aControlTree[i];
			const aInteractions = getCommandInfosFor(oControl);
			const aDocs = await getInteractionDocFor(oControl);

			if (!aInteractions.length && !aDocs.length) {
				continue;
			}

			const sClassName = oControl.getMetadata().getName();

			if (aDocs.length > 0) {
				docs[sClassName] = {
					"interactions": aDocs
				};
				aInteractions.push({
					"$ref": `docs/${sClassName}/interactions`
				});
			}

			elements.push({
				"id": oControl.getId(),
				"class": sClassName,
				"label": getLabelFor(oControl),
				"interactions": aInteractions
			});
		}

		// Update protocol with gathered elements and documentation
		oProtocol.elements = elements;
		oProtocol.docs = docs;

			// Send protocol
		oCurrentPort?.postMessage(JSON.parse(JSON.stringify({
			service: POST_MESSAGE_ENDPOINT_UPDATE,
			type: "request",
			payload: { ...oProtocol }
		})));
	};

	/**
	 * Module that handles the gathering and sending of keyboard interaction information.
	 * When active, it starts listening for pointer and focus events to collect the keyboard interaction data.
	 * The gathered data is then sent via a MessagePort to a connected entity.
	 *
	 * @private
	 */
	return {
		// Indicator if the interaction information gathering is active
		_isActive: false,

		/**
		 * Activates the keyboard interaction information gathering.
		 * This methods starts listening for pointer and focus events to gather the keyboard interaction information.
		 *
		 * @param  {MessagePort} oPort The MessagePort used to send the keyboard interaction information.
		 * @private
		 */
		async activate(oPort) {
			oCurrentPort = oPort;

			if (this._isActive) { return; }

			this._isActive = true;
			await init();
			document.addEventListener("pointerdown", init);
			document.addEventListener("focusin", init);
		},

		/**
		 * Deactivates the keyboard interaction information gathering
		 * This methods stops listening for pointer and focus events, effectively stopping the collection
		 * of the keyboard interaction information.
		 *
		 * @private
		 */
		deactivate() {
			if (!this._isActive) {
				return;
			}
			this._isActive = false;
			document.removeEventListener("pointerdown", init);
			document.removeEventListener("focusin", init);
		}
	};
});