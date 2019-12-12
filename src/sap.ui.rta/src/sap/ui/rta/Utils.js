/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/DOMUtil",
	"sap/m/MessageBox",
	"sap/ui/rta/util/BindingsExtractor",
	"sap/base/Log"
],
function(
	jQuery,
	FlexUtils,
	FlexLayerUtils,
	Settings,
	OverlayUtil,
	DOMUtil,
	MessageBox,
	BindingsExtractor,
	Log
) {
	"use strict";

	/**
	 * Class for Utils.
	 *
	 * @class Utility functionality to work with controls, e.g. iterate through aggregations, find parents, etc.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.30
	 * @alias sap.ui.rta.Utils
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality.
	 * API of this class might be changed in the future.
	 */

	var Utils = {};

	Utils.RESOLVED_PROMISE = Promise.resolve(true);

	Utils._sFocusableOverlayClass = ".sapUiDtOverlaySelectable";

	Utils._sRtaStyleClassName = '';

	/**
	 * Returns the rta specific Style Class
	 *
	 * @return {string} styleClass for RTA
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
		if (sLayer === "USER") {
			Utils._sRtaStyleClassName = "";
		} else if (FlexLayerUtils.getLayerIndex(sLayer) > -1) {
			Utils._sRtaStyleClassName = "sapUiRTABorder";
		}
	};

	/**
	 * Utility function to check if extensibility is enabled in the current system
	 *
	 * @param {sap.ui.core.Control} oControl - Control to be checked
	 * @returns {Promise} resolves a boolean
	 */
	Utils.isExtensibilityEnabledInSystem = function(oControl) {
		var sComponentName = FlexUtils.getComponentClassName(oControl);
		if (!sComponentName || sComponentName === "") {
			return Promise.resolve(false);
		}
		return Settings.getInstance(sComponentName).then(function(oSettings) {
			if (oSettings.isModelS) {
				return oSettings.isModelS();
			}
			return false;
		});
	};

	/**
	 * Utility function to check if the OData service is updated in the meantime
	 *
	 * @param {sap.ui.core.Control} oControl - Control to be checked
	 * @returns {Promise} resolves if service is up to date, rejects otherwise
	 */
	Utils.isServiceUpToDate = function(oControl) {
		return this.isExtensibilityEnabledInSystem(oControl)

		.then(function(bEnabled) {
			if (bEnabled) {
				return new Promise(function(fnResolve, fnReject) {
					sap.ui.require([
						"sap/ui/fl/fieldExt/Access"
					], function(Access) {
						var oModel = oControl.getModel();
						if (oModel) {
							var bServiceOutdated = Access.isServiceOutdated(oModel.sServiceUrl);
							if (bServiceOutdated) {
								Access.setServiceValid(oModel.sServiceUrl);
								//needs FLP to trigger UI restart popup
								sap.ui.getCore().getEventBus().publish("sap.ui.core.UnrecoverableClientStateCorruption", "RequestReload", {});
								return fnReject();
							}
						}
						return fnResolve();
					});
				});
			}
		});
	};

	/**
	 * Utility function to check via backend calls if the custom field button shall be enabled or not
	 *
	 * @param {sap.ui.core.Control} oControl - Control to be checked
	 * @returns {Promise} Returns <boolean> value - true if CustomFieldCreation functionality is to be enabled, false if not
	 */
	Utils.isCustomFieldAvailable = function(oControl) {
		return this.isExtensibilityEnabledInSystem(oControl)

		.then(function(bShowCreateExtFieldButton) {
			if (!bShowCreateExtFieldButton || !oControl.getModel()) {
				return false;
			}

			return new Promise(function(fnResolve, fnReject) {
				sap.ui.require([
					"sap/ui/fl/fieldExt/Access"
				], function(Access) {
					var sServiceUrl = oControl.getModel().sServiceUrl;
					var sEntityType = this.getBoundEntityType(oControl).name;
					var $Deferred;
					try {
						$Deferred = Access.getBusinessContexts(sServiceUrl, sEntityType);
					} catch (oError) {
						Log.error("exception occured in sap.ui.fl.fieldExt.Access.getBusinessContexts", oError);
						fnResolve(false);
					}

					return Promise.resolve($Deferred)
					.then(function(oResult) {
						if (oResult && Array.isArray(oResult.BusinessContexts) && oResult.BusinessContexts.length > 0) {
							oResult.EntityType = sEntityType;
							return fnResolve(oResult);
						}
						return fnResolve(false);
					})
					.catch(function(oError) {
						if (oError) {
							if (Array.isArray(oError.errorMessages)) {
								for (var i = 0; i < oError.errorMessages.length; i++) {
									Log.error(oError.errorMessages[i].text);
								}
							}
						}
						return fnResolve(false);
					});
				}.bind(this), fnReject);
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Opens a confirmation dialog indicating mandatory fields if necessary.
	 *
	 * @param {Object} oElement - The analyzed control
	 * @param {String} sText - Custom text for the dialog
	 * @return {Promise} The Promise which resolves when popup is closed (via Remove OR Cancel actions)
	 */
	Utils.openRemoveConfirmationDialog = function(oElement, sText) {
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var sTitle;
		return new Promise(
			function(resolve) {
				sTitle = oTextResources.getText("CTX_REMOVE_TITLE");

				// create some dummy JSON data and create a Model from it
				var data = {
					messageText : sText,
					titleText : sTitle,
					icon : "sap-icon://question-mark",
					removeText : oTextResources.getText("BTN_FREP_REMOVE"),
					cancelText : oTextResources.getText("BTN_FREP_CANCEL")
				};
				var oModel = new sap.ui.model.json.JSONModel();
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
					removeField : function() {
						fnCleanUp();
						resolve(true);
					},
					closeDialog : function() {
						fnCleanUp();
						resolve(false);
					}
				};

				// instantiate the Fragment if not done yet
				if (!oFragmentDialog) {
					oFragmentDialog = sap.ui.xmlfragment("sap.ui.rta.view.RemoveElementDialog", oFragmentController);
					oFragmentDialog.setModel(oModel);
				}
				oFragmentDialog.addStyleClass(Utils.getRtaStyleClassName());
				oFragmentDialog.open();
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
	 * @param {String} sPropertyName - Name of the property
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
		var sId = jQuery(oDomRef).attr("id");
		if (sId) {
			return sap.ui.getCore().byId(sId);
		}
	};

	/**
	 * Returns the focused overlay
	 *
	 * @returns {sap.ui.dt.ElementOverlay} Overlay object
	 * @private
	 */
	Utils.getFocusedOverlay = function() {
		if (document.activeElement) {
			var oElement = sap.ui.getCore().byId(document.activeElement.id);
			if (oElement instanceof sap.ui.dt.ElementOverlay) {
				return oElement;
			}
		}
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
		if (!oNextFocusableSiblingOverlay) {
			oNextFocusableSiblingOverlay = this._findSiblingOverlay(oOverlay, NEXT);
		}
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
		if (!oPreviousFocusableSiblingOverlay) {
			oPreviousFocusableSiblingOverlay = this._findSiblingOverlay(oOverlay, PREVIOUS);
		}
		return oPreviousFocusableSiblingOverlay;
	};

	/**
	 * Returns an element overlay which is sibling to the given element overlay
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay The overlay to get the information from
	 * @param  {boolean} bNext true for next sibling, false for previous sibling
	 * @return {sap.ui.dt.ElementOverlay} the element overlay which is sibling to the given overlay
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
	 * @param {String} sAggregationName - Aggregation name
	 * @param {Function} [fnGetIndex] - Custom handler for retreiving index
	 * @returns {Number} index of the element
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
	 * @param {String} sEntityType - EntityType which is bound to the parent control
	 * @param {String} sBindingPath - Binding path of the control for which a new Id should be created
	 * @returns {String} New string Id
	 * @private
	 */
	Utils.createFieldLabelId = function(oParentControl, sEntityType, sBindingPath) {
		return (oParentControl.getId() + "_" + sEntityType + "_" + sBindingPath).replace("/", "_");
	};

	/**
	 * Get the entity type based on the binding of a control
	 *
	 * @param {sap.ui.core.Element} oElement - Any Object
	 * @param {sap.ui.model.odata.ODataModel} oModel - Data model
	 * @return {Object} Entity type without namespace
	 */
	Utils.getBoundEntityType = function(oElement, oModel) {
		oModel || (oModel = oElement.getModel());

		var oBindingContext = oElement.getBindingContext();

		if (oBindingContext) {
			return Utils.getEntityTypeByPath(oModel, oBindingContext.getPath()) || {};
		}
		return {};
	};

	/**
	 * Allow window.open to be stubbed in tests
	 *
	 * @param {String} sUrl - url string
	 */
	Utils.openNewWindow = function(sUrl) {
		window.open(sUrl, "_blank");
	};

	/**
	 * Function to find the binding paths of a given UI5 Element
	 *
	 * @param {sap.ui.core.Element} oElement - Element for which the binding info should be found
	 * @returns {Object} valueProperty: the name of the property which is bound
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
					valueProperty : oInfo
				};
			}
		}
		return aPaths;
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
	 * Fetching entity metadata by specified path.
	 * @param {sap.ui.model.Model} oModel - Model
	 * @param {string} sPath Path to resolve
	 * @returns {Object|null} Plain object with entity description
	 */
	Utils.getEntityTypeByPath = function (oModel, sPath) {
		return oModel.oMetadata && oModel.oMetadata._getEntityTypeByPath(sPath);
	};

	/**
	 * Extending helper which allows custom function
	 * for extending.
	 *
	 * @param {Object} mDestination - Destionation object
	 * @param {Object} mSource - Source object
	 * @param {Function} fnCustomizer - The customizer is invoked with five arguments:
	 *                                  (vDestinationValue, vSourceValue, sProperty, mDestination, mSource).
	 */
	Utils.extendWith = function (mDestination, mSource, fnCustomizer) {
		if (!(typeof fnCustomizer === "function")) {
			throw new Error('In order to use extendWith() utility function fnCustomizer should be provided!');
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
	 * @return {boolean} - Returns if <code>oDomElement</code> is currently visible on the screen.
	 */
	Utils.isElementInViewport = function(oDomElement) {
		if (oDomElement instanceof jQuery) {
			oDomElement = oDomElement.get(0);
		}

		var mRect = oDomElement.getBoundingClientRect();

		return (
			mRect.top >= 0 &&
			mRect.left >= 0 &&
			mRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			mRect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	};

	/**
	 * Shows a message box.
	 * @param  {sap.m.MessageBox.Icon|string} oMessageType The type of the message box (icon to be displayed)
	 * @param  {string} sTitleKey The text key for the title of the message box
	 * @param  {string} sMessageKey The text key for the message of the message box
	 * @param  {any} oError Optional - If an error is passed on, the message box text is derived from it
	 * @param  {string} [sAction] text key for the confirm button default @see sap.m.MessageBox.show
	 * @return {Promise} Promise displaying the message box; resolves when it is closed
	 * @private
	 */
	Utils._showMessageBox = function(oMessageType, sTitleKey, sMessageKey, oError, sAction) {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var sMessage = oResourceBundle.getText(sMessageKey, oError ? [oError.message || oError] : undefined);
		var sTitle = oResourceBundle.getText(sTitleKey);
		var vAction = sAction ? oResourceBundle.getText(sAction) : MessageBox.Action.OK;
		return Utils._messageBoxPromise(oMessageType, sMessage, sTitle, vAction);
	};

	Utils._messageBoxPromise = function(oMessageType, sMessage, sTitle, vAction) {
		return new Promise(function(resolve) {
			MessageBox.show(sMessage, {
				icon: oMessageType,
				title: sTitle,
				onClose: resolve,
				actions: vAction,
				styleClass: Utils.getRtaStyleClassName()
			});
		});
	};

	/**
	 * Checks the binding compatibility of source and target control. Absolute binding will not be considered
	 *
	 * @param {sap.ui.core.Element|sap.ui.core.Component} oSource - Source control to be checked for binding compatibility with target control
	 * @param {sap.ui.core.Element|sap.ui.core.Component} oTarget - Target control to be checked for binding compatibility with source control
	 * @param {sap.ui.model.Model} [oModel] - Model for filtering irrelevant binding paths. If empty the the default model from first element is used
	 * @return {boolean} <code>true</code> when the controls have compatible bindings.
	 */
	Utils.checkSourceTargetBindingCompatibility = function(oSource, oTarget, oModel) {
		oModel = oModel || oSource.getModel();
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
	};

	/**
	 * Build hashmap from array of objects
	 *
	 * @param {object} aArray - Array
	 * @param {string} sKeyFieldName - Field name to use as key
	 * @param {string} sValueFieldName - Field name to use as value
	 * @returns {object} Hashmap
	 */
	Utils.buildHashMapFromArray = function (aArray, sKeyFieldName, sValueFieldName) {
		return aArray.reduce(function (mMap, oItem) {
			mMap[oItem[sKeyFieldName]] = oItem[sValueFieldName];
			return mMap;
		}, {});
	};

	return Utils;
}, /* bExport= */true);