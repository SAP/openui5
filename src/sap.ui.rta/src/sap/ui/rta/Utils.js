/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/write/api/Version",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/MetadataPropagationUtil",
	"sap/ui/rta/util/hasStableId",
	"sap/m/MessageBox",
	"sap/ui/rta/util/BindingsExtractor",
	"sap/base/util/restricted/_omit",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/Core"
],
function(
	FieldExtensibility,
	FlexUtils,
	Layer,
	FlexLayerUtils,
	Version,
	OverlayUtil,
	DOMUtil,
	ElementUtil,
	MetadataPropagationUtil,
	hasStableId,
	MessageBox,
	BindingsExtractor,
	_omit,
	JSONModel,
	Fragment,
	Core
) {
	"use strict";

	/**
	 * Utility functionality to work with controls, e.g. iterate through aggregations, find parents, etc.
	 *
	 * @namespace
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.Utils
	 */

	var Utils = {};

	Utils.RESOLVED_PROMISE = Promise.resolve(true);

	Utils._sFocusableOverlayClass = ".sapUiDtOverlaySelectable";

	Utils._sRtaStyleClassName = "";

	/**
	 * Returns the rta specific Style Class
	 *
	 * @returns{string} styleClass for RTA
	 */
	Utils.getRtaStyleClassName = function() {
		return Utils._sRtaStyleClassName;
	};

	/**
	 * Sets the rta specific Style Class to "sapContrast", except for the User layer.
	 *
	 * @param {string} sLayer the current Layer from RTA
	 */
	Utils.setRtaStyleClassName = function(sLayer) {
		if (sLayer === Layer.USER) {
			Utils._sRtaStyleClassName = "";
		} else if (FlexLayerUtils.getLayerIndex(sLayer) > -1) {
			Utils._sRtaStyleClassName = "sapUiRTABorder";
		}
	};

	/**
	 * Utility function to check if the OData service is updated in the meantime
	 *
	 * @param {sap.ui.core.Control} oControl - Control to be checked
	 * @returns {Promise} resolves if service is up to date, rejects otherwise
	 */
	Utils.isServiceUpToDate = function(oControl) {
		return FieldExtensibility.isExtensibilityEnabled(oControl).then(function(bEnabled) {
			if (bEnabled) {
				var oModel = oControl.getModel();
				if (oModel && oModel.sServiceUrl) {
					return FieldExtensibility.isServiceOutdated(oModel.sServiceUrl).then(function(bServiceOutdated) {
						if (bServiceOutdated) {
							FieldExtensibility.setServiceValid(oModel.sServiceUrl);
							// needs FLP to trigger UI restart popup
							Core.getEventBus().publish("sap.ui.core.UnrecoverableClientStateCorruption", "RequestReload", {});
						}
					});
				}
			}
			return undefined;
		});
	};

	/**
	 * Opens a confirmation dialog indicating mandatory fields if necessary.
	 *
	 * @param {object} oElement - The analyzed control
	 * @param {string} sText - Custom text for the dialog
	 * @returns{Promise} The Promise which resolves when popup is closed (via Remove OR Cancel actions)
	 */
	Utils.openRemoveConfirmationDialog = function(oElement, sText) {
		var oTextResources = Core.getLibraryResourceBundle("sap.ui.rta");
		var sTitle;
		return new Promise(
			function(resolve) {
				sTitle = oTextResources.getText("CTX_REMOVE_TITLE");

				// create some dummy JSON data and create a Model from it
				var data = {
					messageText: sText,
					titleText: sTitle,
					icon: "sap-icon://question-mark",
					removeText: oTextResources.getText("BTN_FREP_REMOVE"),
					cancelText: oTextResources.getText("BTN_FREP_CANCEL")
				};
				var oModel = new JSONModel();
				oModel.setData(data);

				var oFragmentDialog;
				var fnCleanUp = function() {
					if (oFragmentDialog) {
						oFragmentDialog.close();
						oFragmentDialog.destroy();
						oFragmentDialog = null;
					}
				};

				// create a controller for the action in the Dialog
				var oFragmentController = {
					removeField() {
						fnCleanUp();
						resolve(true);
					},
					closeDialog() {
						fnCleanUp();
						resolve(false);
					}
				};

				// instantiate the Fragment if not done yet
				if (!oFragmentDialog) {
					Fragment.load({
						name: "sap.ui.rta.view.RemoveElementDialog",
						controller: oFragmentController
					}).then(function(oFragmentDialogT) {
						oFragmentDialog = oFragmentDialogT;
						oFragmentDialog.setModel(oModel);
						oFragmentDialog.addStyleClass(Utils.getRtaStyleClassName());
						oFragmentDialog.open();
					});
				} else {
					oFragmentDialog.addStyleClass(Utils.getRtaStyleClassName());
					oFragmentDialog.open();
				}
			}
		);
	};

	/**
	 * Checks if overlay is selectable in RTA (selectable also means focusable for RTA)
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay object
	 * @returns {boolean} if it's selectable
	 * @private
	 */
	Utils.isOverlaySelectable = function(oOverlay) {
		// check the real DOM visibility should be preformed while oOverlay.isVisible() can be true, but if element
		// has no geometry, overlay will not be visible in UI
		return oOverlay.isSelectable() && DOMUtil.isVisible(oOverlay.getDomRef());
	};

	/**
	 * Utility function for retrieving property values for a specified Element
	 *
	 * @param {sap.ui.core.Element} oElement - Any element
	 * @param {string} sPropertyName - Name of the property
	 * @returns {*} value of the property, could be any value
	 */
	Utils.getPropertyValue = function(oElement, sPropertyName) {
		var oMetadata = oElement.getMetadata().getPropertyLikeSetting(sPropertyName);
		var sPropertyGetter = oMetadata._sGetter;
		return oElement[sPropertyGetter]();
	};

	/**
	 * Returns overlay instance for an overlay's dom element
	 *
	 * @param {document.documentElement} oDomRef - DOM Element
	 * @returns {sap.ui.dt.ElementOverlay} Overlay object
	 * @private
	 */
	Utils.getOverlayInstanceForDom = function(oDomRef) {
		var sId = oDomRef.getAttribute("id");
		if (sId) {
			return Core.byId(sId);
		}
		return undefined;
	};

	/**
	 * Returns the focused overlay
	 *
	 * @returns {sap.ui.dt.ElementOverlay} Overlay object
	 * @private
	 */
	Utils.getFocusedOverlay = function() {
		if (document.activeElement) {
			var oElement = Core.byId(document.activeElement.id);
			if (oElement && oElement.isA("sap.ui.dt.ElementOverlay")) {
				return oElement;
			}
		}
		return undefined;
	};

	/**
	 * Returns the focusable parent overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay object
	 * @returns {sap.ui.dt.ElementOverlay} Found overlay object
	 * @private
	 */
	Utils.getFocusableParentOverlay = function(oOverlay) {
		if (!oOverlay) {
			return undefined;
		}
		var oFocusableParentOverlay = oOverlay.getParentElementOverlay();

		while (oFocusableParentOverlay && !oFocusableParentOverlay.getSelectable()) {
			oFocusableParentOverlay = oFocusableParentOverlay.getParentElementOverlay();
		}
		return oFocusableParentOverlay;
	};

	/**
	 * Returns the first focusable child overlay. Loop over siblings and parents when no focusable siblings found
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay object
	 * @returns {sap.ui.dt.ElementOverlay} Found overlay object
	 * @private
	 */
	Utils.getFirstFocusableDescendantOverlay = function(oOverlay) {
		return OverlayUtil.getFirstDescendantByCondition(oOverlay, this.isOverlaySelectable);
	};

	/**
	 * Returns the last focusable child overlay. Loop over siblings and parents when no focusable siblings found
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay object
	 * @returns {sap.ui.dt.ElementOverlay} Found overlay object
	 * @private
	 */
	Utils.getLastFocusableDescendantOverlay = function(oOverlay) {
		return OverlayUtil.getLastDescendantByCondition(oOverlay, this.isOverlaySelectable);
	};

	/**
	 * Returns the next focusable sibling overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay object
	 * @returns {sap.ui.dt.ElementOverlay} Found overlay object
	 * @private
	 */
	Utils.getNextFocusableSiblingOverlay = function(oOverlay) {
		var NEXT = true;
		var oNextFocusableSiblingOverlay = OverlayUtil.getNextSiblingOverlay(oOverlay);

		while (oNextFocusableSiblingOverlay && !this.isOverlaySelectable(oNextFocusableSiblingOverlay)) {
			oNextFocusableSiblingOverlay = OverlayUtil.getNextSiblingOverlay(oNextFocusableSiblingOverlay);
		}
		oNextFocusableSiblingOverlay ||= this._findSiblingOverlay(oOverlay, NEXT);
		return oNextFocusableSiblingOverlay;
	};

	/**
	 * Returns the previous focusable sibling overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay object
	 * @returns {sap.ui.dt.ElementOverlay} Found overlay object
	 * @private
	 */
	Utils.getPreviousFocusableSiblingOverlay = function(oOverlay) {
		var PREVIOUS = false;
		var oPreviousFocusableSiblingOverlay = OverlayUtil.getPreviousSiblingOverlay(oOverlay);

		while (oPreviousFocusableSiblingOverlay && !this.isOverlaySelectable(oPreviousFocusableSiblingOverlay)) {
			oPreviousFocusableSiblingOverlay = OverlayUtil
			.getPreviousSiblingOverlay(oPreviousFocusableSiblingOverlay);
		}
		oPreviousFocusableSiblingOverlay ||= this._findSiblingOverlay(oOverlay, PREVIOUS);
		return oPreviousFocusableSiblingOverlay;
	};

	/**
	 * Returns an element overlay which is sibling to the given element overlay
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay The overlay to get the information from
	 * @param  {boolean} bNext true for next sibling, false for previous sibling
	 * @returns{sap.ui.dt.ElementOverlay} the element overlay which is sibling to the given overlay
	 * @private
	 */
	Utils._findSiblingOverlay = function(oOverlay, bNext) {
		var oParentOverlay = oOverlay.getParentElementOverlay();
		if (oParentOverlay) {
			var oSiblingOverlay = bNext ?
				OverlayUtil.getNextSiblingOverlay(oParentOverlay) :
				OverlayUtil.getPreviousSiblingOverlay(oParentOverlay);
			if (!oSiblingOverlay) {
				return this._findSiblingOverlay(oParentOverlay, bNext);
			}

			var oDescendantOverlay = bNext ?
				this.getFirstFocusableDescendantOverlay(oSiblingOverlay) :
				this.getLastFocusableDescendantOverlay(oSiblingOverlay);
			return oDescendantOverlay;
		}

		return undefined;
	};

	/**
	 * Utility function for retrieving Element position in the specified Parent
	 *
	 * @param {sap.ui.core.Element} oParentElement - Parent Element
	 * @param {sap.ui.core.Element} oChildElement - Element which position is being looked for
	 * @param {string} sAggregationName - Aggregation name
	 * @param {Function} [fnGetIndex] - Custom handler for retreiving index
	 * @returns {int} index of the element
	 */
	Utils.getIndex = function(oParentElement, oChildElement, sAggregationName, fnGetIndex) {
		var iIndex;
		if (fnGetIndex && typeof fnGetIndex === "function") {
			// fnGetIndex usually comes from designtime metadata, so aggregation name is clear and available in it
			iIndex = fnGetIndex(oParentElement, oChildElement);
		} else {
			var oMetadata = oParentElement.getMetadata();
			var oAggregation = oMetadata.getAggregation(sAggregationName);
			var sGetter = oAggregation._sGetter;
			var aContainers = oParentElement[sGetter]();

			if (Array.isArray(aContainers) && oChildElement) {
				iIndex = aContainers.indexOf(oChildElement) + 1;
			} else {
				iIndex = 0;
			}
		}
		return iIndex;
	};

	/**
	 * Creates a unique id for a new control based on its parent control, entityType and binding path.
	 *
	 * @param {*} oParentControl - Parent control.
	 * @param {string} sEntityType - EntityType which is bound to the parent control
	 * @param {string} sBindingPath - Binding path of the control for which a new Id should be created
	 * @returns {string} New string Id
	 * @private
	 */
	Utils.createFieldLabelId = function(oParentControl, sEntityType, sBindingPath) {
		return (`${oParentControl.getId()}_${sEntityType}_${sBindingPath}`).replace("/", "_");
	};

	/**
	 * Function to find the binding paths of a given UI5 Element
	 *
	 * @param {sap.ui.core.Element} oElement - Element for which the binding info should be found
	 * @returns {object} valueProperty: the name of the property which is bound
	 * @private
	 */
	Utils.getElementBindingPaths = function(oElement) {
		var aPaths = {};
		if (oElement.mBindingInfos) {
			for (var oInfo in oElement.mBindingInfos) {
				var sPath = oElement.mBindingInfos[oInfo].parts[0].path
					? oElement.mBindingInfos[oInfo].parts[0].path
					: "";
				sPath = sPath.split("/")[sPath.split("/").length - 1];
				aPaths[sPath] = {
					valueProperty: oInfo
				};
			}
		}
		return aPaths;
	};

	Utils.isOriginalFioriToolbarAccessible = function() {
		var oRenderer = Utils.getFiori2Renderer();
		return oRenderer
			&& oRenderer.getRootControl
			&& oRenderer.getRootControl().getShellHeader();
	};

	/**
	 * Function to get the Fiori2 Renderer
	 *
	 * @returns {sap.ushell.renderers.fiori2.Renderer|undefined} renderer or null if there is no one
	 */
	Utils.getFiori2Renderer = function() {
		var oContainer = FlexUtils.getUshellContainer() || {};
		return typeof oContainer.getRenderer === "function" ? oContainer.getRenderer("fiori2") : undefined;
	};

	/**
	 * Extending helper which allows custom function
	 * for extending.
	 *
	 * @param {object} mDestination - Destionation object
	 * @param {object} mSource - Source object
	 * @param {Function} fnCustomizer - The customizer is invoked with five arguments:
	 *                                  (vDestinationValue, vSourceValue, sProperty, mDestination, mSource).
	 */
	Utils.extendWith = function(mDestination, mSource, fnCustomizer) {
		if (!(typeof fnCustomizer === "function")) {
			throw new Error("In order to use extendWith() utility function fnCustomizer should be provided!");
		}

		for (var sSourceProperty in mSource) {
			if (mSource.hasOwnProperty(sSourceProperty)) {
				if (fnCustomizer(
					mDestination[sSourceProperty],
					mSource[sSourceProperty],
					sSourceProperty,
					mDestination,
					mSource)
				) {
					mDestination[sSourceProperty] = mSource[sSourceProperty];
				}
			}
		}
	};

	/**
	 * Returns if the <code>oDomElement</code> is currently visible on the screen.
	 *
	 * @param {HTMLElement|jQuery} oDomElement Element to be evaluated
	 * @returns{boolean} - Returns if <code>oDomElement</code> is currently visible on the screen.
	 */
	Utils.isElementInViewport = function(oDomElement) {
		// TODO: remove when all calls are replaced
		oDomElement = oDomElement.jquery ? oDomElement.get(0) : oDomElement;

		var mRect = oDomElement.getBoundingClientRect();

		return (
			mRect.top >= 0 &&
			mRect.left >= 0 &&
			mRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			mRect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	};

	/**
	 * Shows a message box of the specified type; The message consists of the evaluated messagekey and an error text if provided;
	 * The titlekey in the mPropertyBag is also evaluated, the rest is passed to the {@link sap.m.MessageBox} constructor.
	 *
	 * @param  {string} sMessageType - The type of the message box; See available types in {@link sap.m.MessageBox}
	 * @param  {string} sMessageKey - The text key for the message of the message box
	 * @param  {object} [mPropertyBag] - Object with additional information; error and titleKey are evaluated, the rest is passed as option to the MessageBox
	 * @param  {any} [mPropertyBag.error] - If an error is passed on, the message box text is derived from it
	 * @param  {string} [mPropertyBag.titleKey] - The text key for the title of the message box; if none is provided the default of the selectde MessageBox type  will be displayed
	 * @param  {array} [mPropertyBag.actions] - Available actions for the messabe box
	 * @param  {array} [mPropertyBag.actionKeys] - The text key for the action buttons of the message box. It is provided as actions property to the MessageBox.
	 * 											   If mPropertyBag.actions property is set, it will not be overriden
	 * @param {string} [mPropertyBag.emphasizedAction] - Action option to be emphasized
	 * @param {string} [mPropertyBag.emphasizedActionKey] - Text key of the action option to be emphasized
	 * @param {boolean} [mPropertyBag.showCancel] - Whether "cancel" should be part of the actions
	 * @returns{Promise} Promise displaying the message box; resolves when it is closed with the pressed button
	 */
	Utils.showMessageBox = function(sMessageType, sMessageKey, mPropertyBag) {
		return Core.getLibraryResourceBundle("sap.ui.rta", true)
		.then(function(oResourceBundle) {
			mPropertyBag ||= {};
			var sMessage = oResourceBundle.getText(sMessageKey, mPropertyBag.error ? [mPropertyBag.error.userMessage || mPropertyBag.error.message || mPropertyBag.error] : undefined);
			var sTitle = mPropertyBag.titleKey && oResourceBundle.getText(mPropertyBag.titleKey);
			var vActionTexts =
				mPropertyBag.actionKeys &&
				mPropertyBag.actionKeys.map(function(sActionKey) {
					return oResourceBundle.getText(sActionKey);
				});
			var sEmphasizedAction = mPropertyBag.emphasizedActionKey ? oResourceBundle.getText(mPropertyBag.emphasizedActionKey) : undefined;

			var bShowCancel = mPropertyBag.showCancel;
			var mOptions = _omit(mPropertyBag, ["titleKey", "error", "actionKeys", "emphasizedAction", "emphasizedActionKey", "showCancel"]);
			mOptions.title = sTitle;
			mOptions.styleClass = Utils.getRtaStyleClassName();
			mOptions.actions ||= vActionTexts;
			mOptions.emphasizedAction = sEmphasizedAction || mPropertyBag.emphasizedAction;
			if (bShowCancel) {
				mOptions.actions.push(MessageBox.Action.CANCEL);
			}

			return messageBoxPromise(sMessageType, sMessage, mOptions);
		});
	};

	function messageBoxPromise(sMessageType, sMessage, mOptions) {
		return new Promise(function(resolve) {
			mOptions.onClose = resolve;
			MessageBox[sMessageType](sMessage, mOptions);
		});
	}

	/**
	 * Checks the binding compatibility of source and target control. Absolute binding will not be considered
	 *
	 * @param {sap.ui.core.Element|sap.ui.core.Component} oSource - Source control to be checked for binding compatibility with target control
	 * @param {sap.ui.core.Element|sap.ui.core.Component} oTarget - Target control to be checked for binding compatibility with source control
	 * @param {sap.ui.model.Model} [oModel] - Model for filtering irrelevant binding paths. If empty, the default model from first element is used
	 * @returns{boolean} <code>true</code> when the controls have compatible bindings.
	 */
	Utils.checkSourceTargetBindingCompatibility = function(oSource, oTarget, oModel) {
		oModel ||= oSource.getModel();
		var mSourceBindings = BindingsExtractor.collectBindingPaths(oSource, oModel);
		var sSourceContextBindingPath;
		var sTargetContextBindingPath;
		// check source control for property binding
		if (mSourceBindings.bindingPaths.length === 0) {
			return true;
		}
		sSourceContextBindingPath = BindingsExtractor.getBindingContextPath(oSource);
		sTargetContextBindingPath = BindingsExtractor.getBindingContextPath(oTarget);
		// check source and target bindingContext has to be equal
		if (sSourceContextBindingPath === sTargetContextBindingPath) {
			return true;
		}
		return false;
	};

	/**
	 * Checks if every passed control is available and not currently being destroyed
	 * If that is the case a callback function is called and the result returned.
	 *
	 * @param {sap.ui.core.Control[]} aControls - array of controls that should be available
	 * @param {function} fnCallback - function that will be called and the result returned
	 * @returns {any|undefined} Returns the result of the function or undefined
	 */
	Utils.doIfAllControlsAreAvailable = function(aControls, fnCallback) {
		if (aControls.every(function(oControl) {
			return oControl && !oControl._bIsBeingDestroyed;
		})) {
			return fnCallback();
		}
		return undefined;
	};

	/**
	 * Build hashmap from array of objects
	 *
	 * @param {object} aArray - Array
	 * @param {string} sKeyFieldName - Field name to use as key
	 * @param {string} sValueFieldName - Field name to use as value
	 * @returns {object} Hashmap
	 */
	Utils.buildHashMapFromArray = function(aArray, sKeyFieldName, sValueFieldName) {
		return aArray.reduce(function(mMap, oItem) {
			mMap[oItem[sKeyFieldName]] = oItem[sValueFieldName];
			return mMap;
		}, {});
	};

	/**
	 * Checks drop ability for aggregation overlays
	 * @param {sap.ui.dt.Overlay} oAggregationOverlay Aggregation overlay object
	 * @param {sap.ui.dt.ElementOverlay} oMovedOverlay Overlay being moved/added
	 * @param {sap.ui.rta.Plugin} oPlugin RTA plugin calling this method
	 * @param {boolean} [bOverlayNotInDom] Flag defining if overlay is not in DOM
	 * @return {Promise.<boolean>} Promise with true value if overlay can be added to the aggregation overlay or false value if not.
	 * @override
	 */
	Utils.checkTargetZone = function(oAggregationOverlay, oMovedOverlay, oPlugin, bOverlayNotInDom) {
		function fnHasMoveAction(oAggregationOverlay, oElement, oRelevantContainer, oPlugin) {
			var oAggregationDTMetadata = oAggregationOverlay.getDesignTimeMetadata();
			var oMoveAction = oAggregationDTMetadata.getAction("move", oElement);
			if (!oMoveAction) {
				return Promise.resolve(false);
			}
			// moveChangeHandler information is always located on the relevant container
			return oPlugin.hasChangeHandler(oMoveAction.changeType, oRelevantContainer);
		}

		return ElementUtil.checkTargetZone(oAggregationOverlay, oMovedOverlay, bOverlayNotInDom)
		.then(function(bTargetZone) {
			if (!bTargetZone) {
				return false;
			}

			var oMovedElement = oMovedOverlay.getElement();
			var oTargetOverlay = oAggregationOverlay.getParent();
			var oMovedRelevantContainer = oMovedOverlay.getRelevantContainer();

			// the element or the parent overlay might be destroyed or not available
			if (!oMovedElement || !oTargetOverlay) {
				return false;
			}

			var oTargetElement = oTargetOverlay.getElement();
			var oAggregationDtMetadata = oAggregationOverlay.getDesignTimeMetadata();

			// determine target relevantContainer
			var vTargetRelevantContainerAfterMove = MetadataPropagationUtil.getRelevantContainerForPropagation(oAggregationDtMetadata.getData(), oMovedElement);
			vTargetRelevantContainerAfterMove ||= oTargetElement;

			// check for same relevantContainer
			if (
				!oMovedRelevantContainer
					|| !vTargetRelevantContainerAfterMove
					|| !hasStableId(oTargetOverlay)
					|| oMovedRelevantContainer !== vTargetRelevantContainerAfterMove
			) {
				return false;
			}

			// check if binding context is the same
			if (
			// binding context is not relevant if the element is being moved inside its parent
				oMovedOverlay.getParent().getElement() !== oTargetElement
					&& !Utils.checkSourceTargetBindingCompatibility(oMovedElement, oTargetElement)
			) {
				return false;
			}

			// check if movedOverlay is movable into the target aggregation
			return fnHasMoveAction(oAggregationOverlay, oMovedElement, vTargetRelevantContainerAfterMove, oPlugin);
		});
	};

	/**
	 * Check if an existing draft would be overwritten if a change is done on the currently shown version
	 * If so it opens a confirmation dialog.
	 * @param {object} oVersionsModel The versions model
	 * @return {Promise.<boolean>} It either resolves with an indicator whether a confirmation
	 * was shown or rejects with "cancel" if cancel was pressed
	 */
	Utils.checkDraftOverwrite = function(oVersionsModel, bOnlySwitch) {
		var bBackEndDraftExists = oVersionsModel.getProperty("/backendDraft");
		var bDraftDisplayed = oVersionsModel.getProperty("/displayedVersion") === Version.Number.Draft;

		if (
			bDraftDisplayed ||
			!bBackEndDraftExists ||
			bOnlySwitch
		) {
			return Promise.resolve(false);
		}

		// warn the user: the existing draft would be discarded in case the user saves
		return Utils.showMessageBox("warning", "MSG_DRAFT_DISCARD_AND_CREATE_NEW_DIALOG", {
			titleKey: "TIT_DRAFT_DISCARD_DIALOG",
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			emphasizedAction: MessageBox.Action.OK
		})
		.then(function(sAction) {
			if (sAction !== MessageBox.Action.OK) {
				throw "cancel";
			}
			return true;
		});
	};

	return Utils;
}, /* bExport= */true);