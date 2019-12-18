/*
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/transport/Transports",
	"sap/ui/fl/transport/TransportDialog",
	"sap/ui/fl/registry/Settings"
], function(
	LayerUtils,
	Layer,
	Transports,
	TransportDialog,
	FlexSettings
) {
	"use strict";
	/**
	 * @public
	 * @alias sap.ui.fl.transport.TransportSelection
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.38.0
	 * Helper object to select an ABAP transport for an LREP object. This is not a generic utility to select a transport request, but part
	 *        of the SmartVariant control.
	 * @param jQuery.sap.global} jQuery a reference to the jQuery implementation.
	 * @param {sap.ui.fl.Utils} Utils a reference to the flexibility utilities implementation.
	 * @param {sap.ui.fl.transport.Transports} Transports a reference to the transport service implementation.
	 * @param {sap.ui.fl.transport.TransportDialog} TransportDialog a reference to the transport dialog implementation.
	 * @param {sap.ui.fl.registry.Settings} FlexSettings a reference to the settings implementation
	 * @returns {sap.ui.fl.transport.TransportSelection} a new instance of <code>sap.ui.fl.transport.TransportSelection</code>.
	 */
	var TransportSelection = function() {
		this.oTransports = new sap.ui.fl.transport.Transports();
	};

	/**
	 * Selects a transport request for a given LREP object.
	 * If the object info is not provided or not completed, ATO is enabled and the layered repository object is in the CUSTOMER layer:
	 * The request 'ATO_NOTIFICATION' has to be used. This request triggers in the back end that the change is added to an ATO collection.
	 * If the Object Info is completely provided or ATO is not enabled or LREP object not in CUSTOMER layer:
	 * If the LREP object is already assigned to an open transport request or the LREP object is
	 * assigned to a local ABAP package, no dialog to select a transport is started. Instead the success callback is invoked directly.
	 * If the LREP object is not local and ATO is enabled and the layered repository object is in the CUSTOMER layer, The request 'ATO_NOTIFICATION' has to be used.
	 * Otherwise, dialog is shown if a package or a transport request has still to be selected, so if more than one transport request is available for the
	 * current user and the LREP object is not locked in an open transport request.
	 *
	 * @param {object} oObjectInfo the LREP object, which has the attributes name, name space, type, layer and package.
	 * @param {function} fOkay call-back to be invoked when a transport request has successfully been selected.
	 * @param {function} fError call-back to be invoked when an error occurred during selection of a transport request.
	 * @param {boolean} bCompactMode flag indicating whether the transport dialog should be opened in compact mode.
	 * @param {object} oControl Control instance
	 * @public
	 */
	TransportSelection.prototype.selectTransport = function(oObjectInfo, fOkay, fError, bCompactMode, oControl, sStyleClass) {
		var retrieveTransportInfo = function(oObjectInfo, fOkay, fError, bCompactMode, sStyleClass, bATOActive) {
			this.oTransports.getTransports(oObjectInfo).then(function(oGetTransportsResult) {
				if (this._checkDialog(oGetTransportsResult, bATOActive)) {
					this._openDialog({
						hidePackage: !LayerUtils.doesCurrentLayerRequirePackage(),
						pkg: oObjectInfo.package,
						transports: oGetTransportsResult.transports,
						lrepObject: this._toLREPObject(oObjectInfo)
					}, fOkay, fError, bCompactMode, sStyleClass);
				} else {
					var oTransport = (!oGetTransportsResult.localonly && bATOActive) ? { transportId: "ATO_NOTIFICATION" } : this._getTransport(oGetTransportsResult);
					fOkay(this._createEventObject(oObjectInfo, oTransport));
				}
			}.bind(this), function(oResult) {
				fError(oResult);
			});
		};

		var sLayerType = LayerUtils.getCurrentLayer(false);
		//First check the current layer
		if (sLayerType && ((sLayerType === Layer.CUSTOMER) || (sLayerType === Layer.CUSTOMER_BASE))) {
			//CUSTOMER layer --> retrieve the settings and check if ATO is enabled
			FlexSettings.getInstance().then(function (oSettings) {
				if (oSettings.isAtoEnabled()) {
					//ATO is enabled
					if (!(oObjectInfo && oObjectInfo.name && oObjectInfo.namespace && oObjectInfo.type)) {
						//Object info is not completed (public scenario)+ ATO is enabled + CUSTOMER layer: No getTransport is necessary
						var oTransport = { transportId: "ATO_NOTIFICATION" };
						fOkay(this._createEventObject(oObjectInfo, oTransport));
					} else {
						//Object info is completed (delete/reset scenario) --> retrieve transport info to distinguish local object
						retrieveTransportInfo.apply(this, [oObjectInfo, fOkay, fError, bCompactMode, sStyleClass, true]);
					}
				} else {
					retrieveTransportInfo.apply(this, [oObjectInfo, fOkay, fError, bCompactMode, sStyleClass, false]);
				}
			}.bind(this));
		} else {
			retrieveTransportInfo.apply(this, [oObjectInfo, fOkay, fError, bCompactMode, sStyleClass, false]);
		}
	};

	/**
	 * Creates an event object similar to the UI5 event object.
	 *
	 * @param {object} oObjectInfo identifies the LREP object.
	 * @param {object} oTransport the transport request that has been selected.
	 * @return {object} event object.
	 * @private
	 */
	TransportSelection.prototype._createEventObject = function(oObjectInfo, oTransport) {
		return {
			mParameters: {
				selectedTransport: oTransport.transportId,
				selectedPackage: oObjectInfo["package"],
				dialog: false
			},
			getParameters: function() {
				return this.mParameters;
			},
			getParameter: function(sName) {
				return this.mParameters[sName];
			}
		};
	};

	/**
	 * Creates an LREP object description for the transport dialog.
	 *
	 * @param {object} oObjectInfo identifies the LREP object.
	 * @return {object} LREP object description for the transport dialog.
	 * @private
	 */
	TransportSelection.prototype._toLREPObject = function(oObjectInfo) {
		var oObject = {};

		if (oObjectInfo.namespace) {
			oObject.namespace = oObjectInfo.namespace;
		}

		if (oObjectInfo.name) {
			oObject.name = oObjectInfo.name;
		}

		if (oObjectInfo.type) {
			oObject.type = oObjectInfo.type;
		}

		return oObject;
	};

	/**
	 * Opens the dialog to select a transport request.
	 *
	 * @param {object} oConfig configuration for the dialog, e.g. package and transports.
	 * @param {function} fOkay call-back to be invoked when a transport request has successfully been selected.
	 * @param {function} fError call-back to be invoked when an error occurred during selection of a transport request.
	 * @param {boolean} bCompactMode flag indicating whether the transport dialog should be opened in compact mode.
	 * @returns {sap.ui.fl.transport.TransportDialog} the dialog.
	 * @private
	 */
	TransportSelection.prototype._openDialog = function(oConfig, fOkay, fError, bCompactMode, sStyleClass) {
		var oDialog = new TransportDialog(oConfig);
		oDialog.attachOk(fOkay);
		oDialog.attachCancel(fError);
		oDialog.addStyleClass(sStyleClass);

		// toggle compact style.
		if (bCompactMode) {
			oDialog.addStyleClass("sapUiSizeCompact");
		} else {
			oDialog.removeStyleClass("sapUiSizeCompact");
		}

		oDialog.open();

		return oDialog;
	};

	/**
	 * Returns a transport to assign an LREP object to.
	 *
	 * @param {object} oTransports the available transports.
	 * @returns {object} a transport to assign an LREP object to, can be <code>null</code>.
	 * @private
	 */
	TransportSelection.prototype._getTransport = function(oTransports) {
		var oTransport;

		if (!oTransports.localonly) {
			oTransport = this._hasLock(oTransports.transports);
		} else {
			oTransport = {
				transportId: ""
			};
		}

		return oTransport;
	};

	/**
	 * Returns whether the dialog to select a transport should be started.
	 *
	 * @param {object} oTransports The available transports.
	 * @param {boolean} bATOActive Whether the system is using ATO_NOTIFICATION or not.
	 * @returns {boolean} <code>true</code>, if the LREP object is already locked in one of the transports, <code>false</code> otherwise.
	 * @private
	 */
	TransportSelection.prototype._checkDialog = function(oTransports, bATOActive) {
		if (oTransports) {
			if (oTransports.localonly || this._hasLock(oTransports.transports) || (!oTransports.localonly && bATOActive)) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Returns whether the LREP object is already locked in one of the transports.
	 *
	 * @param {array} aTransports the available transports.
	 * @returns {object} the transport, if the LREP object is already locked in one of the transports, <code>null</code> otherwise.
	 * @private
	 */
	TransportSelection.prototype._hasLock = function(aTransports) {
		var len = aTransports.length;

		while (len--) {
			var oTransport = aTransports[len];

			if (oTransport.locked) {
				return oTransport;
			}
		}

		return false;
	};

	/**
	 * Sets the transports for all changes.
	 *
	 * @param {array} aChanges array of {sap.ui.fl.Change}
	 * @param {object} oControl object of the root control for the transport
	 * @returns {Promise} promise that resolves without parameters or rejects with "cancel" value in case of escape/cancel from transport dialog triggered
	 * @public
	 */
	TransportSelection.prototype.setTransports = function(aChanges, oControl) {
		// do a synchronous loop over all changes to fetch transport information per change each after the other
		// this is needed because only one transport popup should be shown to the user and not one per change

		var iChangeIdx = aChanges.length - 1;
		var that = this;
		var fnSetTransports = function(aChanges, iChangeIdx, oControl, sTransport, bFromDialog) {
			if (iChangeIdx >= 0) {
				var oCurrentChange = aChanges[iChangeIdx];

				if (bFromDialog === true) {
					// if the request has been set by the transport dialog already,
					// do not bring up the transport dialog a second time, but use this transport instead
					// if the change is locked on another transport, this will be resolved in the back end when the DELETE request is send
					if (oCurrentChange.getDefinition().packageName !== "$TMP") {
						oCurrentChange.setRequest(sTransport);
					}
					iChangeIdx--;
					// set the transport for the next request
					return fnSetTransports(aChanges, iChangeIdx, oControl, sTransport, bFromDialog);
				}
				// bring up the transport dialog to get the transport information for a change
				if (oCurrentChange.getDefinition().packageName !== "$TMP") {
					return that.openTransportSelection(oCurrentChange, oControl).then(function(oTransportInfo) {
						if (oTransportInfo === "cancel") {
							return Promise.reject("cancel");
						}
						oCurrentChange.setRequest(oTransportInfo.transport);

						if (oTransportInfo.fromDialog === true) {
							sTransport = oTransportInfo.transport;
							bFromDialog = true;
						}

						iChangeIdx--;
						// set the transport for the next request
						return fnSetTransports(aChanges, iChangeIdx, oControl, sTransport, bFromDialog);
					}, function () {
						return null;
					});
				}

				iChangeIdx--;
				// set the transport for the next request
				return fnSetTransports(aChanges, iChangeIdx, oControl, sTransport, bFromDialog);
			}

			return Promise.resolve(); // last change has been processed, continue with discarding the changes
		};

		return fnSetTransports(aChanges, iChangeIdx, oControl);
	};

	/**
	 * Opens the transport selection dialog
	 *
	 * @param {sap.ui.fl.Change} [oChange] - the change for which the transport information should be retrieved
	 * @param {object} oControl
	 * @returns {Promise} promise that resolves
	 * @public
	 */
	TransportSelection.prototype.openTransportSelection = function(oChange, oControl, sStyleClass) {
		var that = this;

		return new Promise(function(resolve, reject) {
			var fnOkay = function(oResult) {
				if (oResult && oResult.getParameters) {
					var sTransport = oResult.getParameters().selectedTransport;
					var sPackage = oResult.getParameters().selectedPackage;
					var bFromDialog = oResult.getParameters().dialog;
					var oTransportInfo = {
						transport: sTransport,
						packageName: sPackage,
						fromDialog: bFromDialog
					};
					resolve(oTransportInfo);
				} else {
					resolve({});
				}
			};
			var fnError = function(oError) {
				if (oError.sId === 'cancel') {
					resolve(oError.sId);
				} else {
					reject(oError);
				}
			};
			var oObject = {}; // no restriction on package, name or name space
			if (oChange) {
				oObject["package"] = oChange.getPackage();
				oObject.namespace = oChange.getNamespace();
				oObject.name = oChange.getId();
				oObject.type = oChange.getDefinition().fileType;
			}

			that.selectTransport(oObject, fnOkay, fnError, false, oControl, sStyleClass);
		});
	};

	/**
	 * Checks transport info object
	 *
	 * @param {Object} [oTransportInfo] - transport info object
	 * @returns {boolean} returns true if transport info is complete
	 * @public
	 */
	TransportSelection.prototype.checkTransportInfo = function(oTransportInfo) {
		return oTransportInfo && oTransportInfo.transport && oTransportInfo.packageName !== "$TMP";
	};

	/**
	 * Prepare all changes and assign them to an existing transport.
	 *
	 * @public
	 * @param {Object} oTransportInfo Object containing the package name and the transport
	 * @param {string} oTransportInfo.packageName Name of the package
	 * @param {string} oTransportInfo.transport ID of the transport
	 * @param {Array} aAllLocalChanges Array that includes all local changes
	 * @param {Array} [aAppVariantDescriptors] Array that includes all app variant descriptors
	 * @param {object} oContentParameters Object containing parameters added into the publish request
	 * @param {string} oContentParameters.reference Application ID of the changes which should be transported
	 * @param {string} oContentParameters.appVersion Version of the application for which the changes should be transported
	 * @param {string} oContentParameters.layer Layer in which the changes are stored
	 * @returns {Promise} Returns a Promise which resolves without parameters
	 */
	TransportSelection.prototype._prepareChangesForTransport = function(oTransportInfo, aAllLocalChanges, aAppVariantDescriptors, oContentParameters) {
		// Pass list of changes to be transported with transport request to backend
		var oTransports = new Transports();
		var aTransportData = oTransports._convertToChangeTransportData(aAllLocalChanges, aAppVariantDescriptors);
		var oTransportParams = {};
		//packageName is '' in CUSTOMER layer (no package input field in transport dialog)
		oTransportParams.package = oTransportInfo.packageName;
		oTransportParams.transportId = oTransportInfo.transport;
		oTransportParams.changeIds = aTransportData;
		oTransportParams.reference = oContentParameters.reference;
		oTransportParams.appVersion = oContentParameters.appVersion;
		oTransportParams.layer = oContentParameters.layer;

		return oTransports.makeChangesTransportable(oTransportParams).then(function() {
			// remove the $TMP package from all changes; has been done on the server as well,
			// but is not reflected in the client cache until the application is reloaded
			aAllLocalChanges.forEach(function(oChange) {
				if (oChange.getPackage() === '$TMP') {
					var oDefinition = oChange.getDefinition();
					oDefinition.packageName = oTransportInfo.packageName;
					oChange.setResponse(oDefinition);
				}
			});
		});
	};

	return TransportSelection;
}, true);
