/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Element",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/ChangesWriteAPI"
], function(
	Log,
	Element,
	JsControlTreeModifier,
	OverlayRegistry,
	ChangesWriteAPI
) {
	"use strict";

	/**
	 * Service to register message event listeners for the communication with the
	 * Flex Support web extension.
	 *
	 * This is implemented as a service and not as part of the injected script because
	 * there is no easy way to retrieve the RuntimeAuthoring instance otherwise.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.SupportTools
	 * @author SAP SE
	 * @since 1.106
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */

	const sHighlightClass = "sapUiFlexibilitySupportExtension_Selected";
	const sGlobalVariableName = "ui5flex$temp";
	window[sGlobalVariableName] = {}; // Container for all temp. variables
	const aTempVariables = window[sGlobalVariableName];
	let nTempVarCount = 0;

	/**
	 * Logs a message to the console
	 * @param {string} sMessage - Message to be logged
	 * @param {object} oVariable - Variable containing Object to be logged
	 */
	function logToConsole(sMessage, oVariable) {
		console.log(`Flextention: ${sMessage}`); // eslint-disable-line no-console
		if (oVariable) {
			console.log(oVariable); // eslint-disable-line no-console
		}
	}

	function getPluginChangeHandler(oPlugin, oElementOverlay, oRta) {
		const oAction = oPlugin.getAction(oElementOverlay);
		if (oAction && oAction.changeType) {
			const oElement = oAction.changeOnRelevantContainer
				? oElementOverlay.getRelevantContainer()
				: oElementOverlay.getElement();
			return ChangesWriteAPI.getChangeHandler({
				changeType: oAction.changeType,
				element: oElement,
				modifier: JsControlTreeModifier,
				layer: oRta.getLayer()
			})
			.then(function(oChangeHandler) {
				return oChangeHandler;
			})
			.catch(function() {
				return;
			});
		}
		return Promise.resolve(undefined);
	}

	function isPluginForSibling(sPluginName) {
		if (sPluginName.endsWith(".asSibling")) {
			return true;
		}
		if (sPluginName.endsWith(".asChild")) {
			return false;
		}
		return undefined;
	}

	function getPluginByName(oRta, sPluginName) {
		const bIsSibling = isPluginForSibling(sPluginName);
		const oAllPlugins = oRta.getPlugins();
		return Object.values(oAllPlugins).find(function(oPlugin) {
			const sName = oPlugin._retrievePluginName
				? oPlugin._retrievePluginName(bIsSibling)
				: oPlugin.getMetadata().getName();
			return sName === sPluginName;
		});
	}

	/*
	 * Removes the highlighting of a non-selectable overlay
	 */
	function removeSelectionHighlight() {
		const aHighlightedDom = document.getElementsByClassName(sHighlightClass);
		if (aHighlightedDom.length > 0) {
			aHighlightedDom[0].classList.remove(sHighlightClass);
		}
	}

	/*
	 * Returns information about an overlay, namely:
	 * For every plugin that is part of the "editableByPlugins"
	 * aggregation, we return the plugin name and the result for
	 * isAvailable(). If the change handler can be determined, we
	 * return this information, which enables a button allowing the
	 * key user to print the change handler to the console.
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} mPayload - Property Bag
	 * @param {string} mPayload.overlayId
	 * @returns {Promise<object|null>} Resolves with the overlay info
	 */
	async function getOverlayInfo(oRta, mPayload) {
		const oOverlay = Element.getElementById(mPayload.overlayId);
		if (!oOverlay) {
			return null;
		}
		const oElement = oOverlay.getElement();

		// remove previous selection highlighting on clicking in the app
		if (oOverlay.getSelectable()) {
			removeSelectionHighlight();
		}

		const mEditableByPlugins = oOverlay.getEditableByPlugins();
		const aEditableByPlugins = Object.keys(mEditableByPlugins)
		.filter(function(sPluginName) {
			return mEditableByPlugins[sPluginName];
		});

		const aPlugins = await Promise.all(aEditableByPlugins.map(async function(sPluginName) {
			const oInstance = getPluginByName(oRta, sPluginName);
			const bIsSibling = isPluginForSibling(sPluginName);

			const oChangeHandler = await getPluginChangeHandler(oInstance, oOverlay, oRta);
			return {
				name: sPluginName,
				isAvailable: oInstance.isAvailable([oOverlay], bIsSibling),
				hasChangeHandler: !!oChangeHandler
			};
		}));

		return {
			elementId: oElement.getId(),
			elementControlType: oElement.getMetadata().getName(),
			overlayId: oOverlay.getId(),
			plugins: aPlugins
		};
	}

	/**
	 * Prints the change handler to the console
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} mPayload - Property Bag
	 * @param {string} mPayload.overlayId - ID of the Overlay
	 * @param {string} mPayload.pluginName - Name of the Plugin
	 */
	async function printChangeHandler(oRta, mPayload) {
		const oOverlay = Element.getElementById(mPayload.overlayId);
		const oPlugin = getPluginByName(oRta, mPayload.pluginName);
		const oChangeHandler = await getPluginChangeHandler(oPlugin, oOverlay, oRta);
		if (oPlugin) {
			try {
				const sPluginId = oPlugin.getId();
				const sTempVariableName = aTempVariables[sPluginId] && aTempVariables[sPluginId].savedAs || `ui5flex$${nTempVarCount++}`;
				aTempVariables[sPluginId] = {
					description: `ChangeHandler for Plugin: ${sPluginId} - ${mPayload.pluginName}`,
					changeHandler: oChangeHandler,
					savedAs: sTempVariableName
				};
				const oVariable = aTempVariables[sPluginId];
				window[sTempVariableName] = aTempVariables[sPluginId];
				const sMessage = `ChangeHandler copied to global var ${sTempVariableName}, all vars are collected in global var ${sGlobalVariableName}`;
				logToConsole(sMessage, oVariable);
			} catch (oError) {
				// Ignore errors
			}
		} else {
			logToConsole("ChangeHandler could not be logged", undefined);
		}
	}

	/*
	 * Closes the ContextMenu of the UI-Adaptation (if open)
	 * This method is called when user selects a non-selectable
	 * Overlay in Flex Support web extension (Overlay section)
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 */
	function closeContextMenu(oRta) {
		if (document.getElementsByClassName("sapUiDtContextMenu").length > 0) {
			const oContextMenu = oRta.getPlugins().contextMenu;
			oContextMenu.oContextMenuControl.close();
		}
	}

	/*
	 * Changes the focus/selection in UI-Adaptation
	 * This method is called when user selects an entry in
	 * the overlay table of the Flex Support web extension (Overlay Info Section)
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} mPayload - Property Bag
	 * @param {string} mPayload.overlayId - ID of the Overlay
	 */
	function changeOverlaySelection(oRta, mPayload) {
		// set new focus and enforce collecting overlay info data
		const oOverlay = Element.getElementById(mPayload.overlayId);
		oOverlay.focus();
		window.postMessage({
			type: "getOverlayInfo",
			id: "ui5FlexibilitySupport.submodules.overlayInfo",
			content: {
				overlayId: oOverlay.getId()
			}
		});

		// remove previous selection highlighting
		removeSelectionHighlight();
		// close the contextmenu in UI-Adaptation
		closeContextMenu(oRta);

		// remove current selection(s)
		const aSelection = oRta.getSelection();
		aSelection.forEach(function(oSelectedOverlay) {
			oSelectedOverlay.setSelected(false);
		});

		// set new selection (selectable overlays)
		if (oOverlay.getSelectable()) {
			oOverlay.setSelected(true);
		} else if (oOverlay.getDomRef()) {
			// highlight unselectable overlay
			oOverlay.getDomRef().classList.add("sapUiFlexibilitySupportExtension_Selected");
		}
	}

	/*
	 * Collects all relevant data for the overlay table in
	 * Flex Support web extension (Overlay section)
	 * This method is called during initialization of the
	 * Overlay section and on pressing the "Reload" button
	 */
	function collectOverlayTableData() {
		// create an array with all relevant overlays (no aggregation overlays)
		const aAllOverlays = OverlayRegistry.getOverlays();
		const aRelevantOverlayList = [];
		aAllOverlays.forEach(function(oOverlay) {
			if (!oOverlay.isA("sap.ui.dt.AggregationOverlay")) {
				const sParentId = oOverlay.getParentElementOverlay()?.getId();
				const aChildren = oOverlay.getChildren().map(function(oChild) {
					return oChild.getId();
				});
				aRelevantOverlayList.push({
					id: oOverlay.getId(),
					parentId: sParentId,
					elementId: oOverlay.getElement().getId(),
					visible: oOverlay.getSelectable() && oOverlay.isVisible(),
					idNum: parseInt(oOverlay.getId().replace("__overlay", "")),
					children: aChildren,
					hasParent: sParentId !== undefined
				});
			}
		});
		return aRelevantOverlayList;
	}

	/**
	 * Prints the design time metadata to the console
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} mPayload - Property Bag
	 * @param {string} mPayload.overlayId - ID of the Overlay
	 */
	function printDesignTimeMetadata(oRta, mPayload) {
		const oOverlay = Element.getElementById(mPayload.overlayId);
		const oMetaData = oOverlay.getDesignTimeMetadata().getData();
		if (oMetaData) {
			try {
				const sMetaDataId = oOverlay.getDesignTimeMetadata().getId();
				const sTempVariableName = aTempVariables[sMetaDataId] && aTempVariables[sMetaDataId].savedAs || `ui5flex$${nTempVarCount++}`;
				aTempVariables[sMetaDataId] = {
					description: `DesignTimeMetaData: ${sMetaDataId} for Overlay: ${mPayload.overlayId}`,
					metaData: oMetaData,
					savedAs: sTempVariableName
				};
				const oVariable = aTempVariables[sMetaDataId];
				window[sTempVariableName] = aTempVariables[sMetaDataId];
				const sMessage = `MetaData copied to global var ${sTempVariableName}, all vars are collected in global var ${sGlobalVariableName}`;
				logToConsole(sMessage, oVariable);
			} catch (oError) {
				// Ignore errors
			}
		} else {
			logToConsole("DesignTimeMetaData could not be logged", undefined);
		}
	}

	// List of supported handlers
	const mHandlers = {
		getOverlayInfo: {
			handler: getOverlayInfo,
			returnMessageType: "overlayInfo",
			id: "ui5FlexibilitySupport.submodules.overlayInfo"
		},
		printChangeHandler: {
			handler: printChangeHandler,
			id: "ui5FlexibilitySupport.submodules.overlayInfo"
		},
		printDesignTimeMetadata: {
			handler: printDesignTimeMetadata,
			id: "ui5FlexibilitySupport.submodules.overlayInfo"
		},
		changeOverlaySelection: {
			handler: changeOverlaySelection,
			id: "ui5FlexibilitySupport.submodules.overlayInfo"
		},
		collectOverlayTableData: {
			handler: collectOverlayTableData,
			returnMessageType: "overlayInfoTableData",
			id: "ui5FlexibilitySupport.submodules.overlayInfo"
		}
	};

	/*
	 * Handler method for the Rta event "stop"
	 * sends a corresponding message to the
	 * Flex Support web extension (Overlay section)
	 */
	function onRtaStop() {
		window.postMessage({
			type: "rtaStopped",
			id: "ui5FlexibilitySupport.submodules.overlayInfo",
			content: {}
		});
	}

	/*
	 * Sends a message to the Flex Support
	 * web extension (Overlay section) that
	 * UI Adaption has started
	 */
	function onRtaStart() {
		window.postMessage({
			type: "rtaStarted",
			id: "ui5FlexibilitySupport.submodules.overlayInfo",
			content: {}
		});
	}

	/*
	 * Event handler for the messages sent by the support extension.
	 *
	 * Messages are contained in oEvent.data - the following properties
	 * are sent:
	 *  - type: specifies, what action should be taken. Possible values:
	 *   - getOverlayInfo (request information about an overlay)
	 *   - printChangeHandler (a specified change handler object is to be printed to the console)
	 *   - printDesignTimeMetadata (the calculated designtime metadata of the overlay is to be printed to the console)
	 * - content: type-specific information, e.g. for getOverlayInfo, an 'overlayId' is provided
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} oEvent - Event thrown by the browser on received message
	 */
	function onMessageReceived(oRta, oEvent) {
		if (oEvent.source !== window) {
			return;
		}

		const aHandler = Object.entries(mHandlers).find(function(aEntry) {
			return (
				aEntry[0] === oEvent.data.type
				&& aEntry[1].id === oEvent.data.id
			);
		});
		const mHandler = aHandler && aHandler[1];

		if (mHandler) {
			Promise.resolve(mHandler.handler(oRta, oEvent.data.content))
			.then(function(oResult) {
				if (mHandler.returnMessageType) {
					oEvent.source.postMessage({
						id: mHandler.id,
						type: mHandler.returnMessageType,
						content: oResult
					});
				}
			});
		}
	}

	return function(oRta) {
		const fnOnMessageReceivedBound = onMessageReceived.bind(null, oRta);
		window.addEventListener("message", fnOnMessageReceivedBound);
		oRta.attachEventOnce("stop", onRtaStop);
		onRtaStart();

		return {
			destroy() {
				window.removeEventListener("message", fnOnMessageReceivedBound);
			}
		};
	};
});