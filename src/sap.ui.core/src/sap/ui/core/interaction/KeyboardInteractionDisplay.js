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
	 * Attempts to retrieve a user-friendly label for a given control by examining associated field help,
	 * accessibility info, ARIA attributes, and a provided interaction XML document.
	 *
	 * The method follows this priority order:
	 * 1. Field help label via `getFieldHelpDisplay`.
	 * 2. Label metadata via `LabelEnablement._getLabelTexts`.
	 * 3. Control's accessibility info (`getAccessibilityInfo`).
	 * 4. Label from interaction XML (if matching control metadata is found).
	 * 5. ARIA `aria-labelledby` attribute from DOM or descendants.
	 * 6. Fallback to control metadata name if no label is found.
	 *
	 * @param  {sap.ui.core.Control} oControl The control to analayze.
	 * @param {XMLDocument} oInteractionXML The interaction document
	 * @return {string} The label associated with the control.
	 */
	const getLabelFor = (oControl, oInteractionXML) => {
		const sDisplayControlId = oControl.getFieldHelpDisplay();
		const oLabelControl = sDisplayControlId
			? Element.getElementById(sDisplayControlId)
			: oControl;

		// First, try to derive control label from field help, if available
		let sAccessibilityInfoLabel = LabelEnablement._getLabelTexts(oLabelControl)[0];

		// Then, try derive control label from accessibility info, if available
		if (!sAccessibilityInfoLabel) {
			const oAccessibilityInfo = oControl.getAccessibilityInfo?.();
			if (oAccessibilityInfo) {
				sAccessibilityInfoLabel = oAccessibilityInfo.description || oAccessibilityInfo.children?.[0]?.getAccessibilityInfo?.()?.description || null;
			}
		}

		const ARIA_LABELLED_BY_ATTR = "aria-labelledby";

		if (!sAccessibilityInfoLabel) {
			let sAriaLabelledById;
			let oCurrent = oControl;
			let bCheckedInteractionDoc = false;

			while (oCurrent && !sAriaLabelledById && !sAccessibilityInfoLabel) {
				const oDomRef = oControl.getDomRef();

				// Try to derive control label from DOM
				sAriaLabelledById = oDomRef?.getAttribute(ARIA_LABELLED_BY_ATTR);

				// Try interaction doc only once
				if (!sAriaLabelledById && !bCheckedInteractionDoc) {
					bCheckedInteractionDoc = true;

					const oInteractionDoc = oInteractionXML.documentElement;
					if (oInteractionDoc) {
						const aControlInteractionNodes = [...oInteractionDoc.querySelectorAll("control-interactions")];
						const oMatchingControl = aControlInteractionNodes.find((oNode) => {
							return oNode.querySelector("control")?.getAttribute("name") === oControl.getMetadata().getName();
						});

						sAccessibilityInfoLabel = oMatchingControl?.querySelector("control")?.querySelector("defaultLabel")?.textContent;
					}
				}

				// Try to find aria label from descendents
				if (!sAriaLabelledById && !sAccessibilityInfoLabel) {
					const oLabelledByElement = oDomRef.querySelector("[aria-labelledby]");
					sAriaLabelledById = oLabelledByElement?.getAttribute(ARIA_LABELLED_BY_ATTR);
				}

				oCurrent = oCurrent.getParent?.();
			}

			if (!sAccessibilityInfoLabel && sAriaLabelledById) {
				const oLabelElement = document.getElementById(sAriaLabelledById);
				sAccessibilityInfoLabel = oLabelElement?.textContent || null;
			}
		}

		return sAccessibilityInfoLabel || oControl.getMetadata().getName();
	};

	/**
	 * Load and access interaction-documentation for given control.
	 * @param {sap.ui.core.Control} oControl The control to load the interaction document for
	 * @param {string} sLibrary The library name if already available
	 * @return {Promise<null|XMLDocument>} The interaction document or 'null'.
	 */
	const loadInteractionXMLFor = async (oControl, sLibrary) => {
		let oCurrent = oControl;

		// Traverse up the control hierarchy to find the library name
		while (oCurrent && !sLibrary) {
			sLibrary = oCurrent.getMetadata().getLibraryName();
			oCurrent = oCurrent.getParent();
		}

		if (!sLibrary) {
			return null;
		}

		const oLibrary = Library._get(sLibrary);
		if (!oLibrary?.interactionDocumentation) {
			return null;
		}

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

		const aControlInteractionNodes = [...oInteractionDoc.querySelectorAll("control-interactions")];
		const oMatchingControl = aControlInteractionNodes.find((oNode) => {
			return oNode.querySelector("control")?.getAttribute("name") === sControlName;
		});

		if (!oMatchingControl) {
			return [];
		}

		return [...oMatchingControl.querySelectorAll("interaction")].map((oInteractionNode) => ({
			kbd: Array.from(oInteractionNode.children).filter((child) => child.tagName === "kbd").map((kbd) => kbd.textContent.trim()),
			description: oInteractionNode.querySelector("description")?.innerHTML || ""
		}));
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
		const oCoreXML = await loadInteractionXMLFor(null, "sap.ui.core");
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
			const sControlName = oControl.getMetadata().getName();

			// get command infos
			const aInteractions = getCommandInfosFor(oControl);

			// get interactions from interaction documentation
			const oInteractionXML = await loadInteractionXMLFor(oControl);
			const aDocs = oInteractionXML ? getInteractions(sControlName, oInteractionXML) : [];

			if (!aInteractions.length && !aDocs.length) {
				// no commands and no interaction documentation
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
				"label": getLabelFor(oControl, oInteractionXML),
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