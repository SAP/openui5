/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/transport/TransportSelection",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Change",
	"sap/ui/core/Component",
	"sap/ui/core/BusyIndicator",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/base/util/restricted/_pick"
], function(
	merge,
	BaseConnector,
	ApplyConnector,
	ApplyUtils,
	WriteUtils,
	TransportSelection,
	Settings,
	Layer,
	LayerUtils,
	Change,
	Component,
	BusyIndicator,
	Log,
	MessageBox,
	_pick
) {
	"use strict";

	var ROUTES = {
		FLEX_INFO: "/flex/info/",
		PUBLISH: "/actions/make_changes_transportable/",
		CHANGES: "/changes/",
		VARIANTS: "/variants/",
		SETTINGS: "/flex/settings",
		TOKEN: "/actions/getcsrftoken/",
		APPVARIANTS: "/appdescr_variants/",
		APPVARIANTS_OVERVIEW: "/app_variant_overview/"
	};

	/**
	 * Write flex data into LRep back end or update an existing flex data stored in LRep back end
	 *
	 * @param {object} mPropertyBag Property bag
	 * @param {string} mPropertyBag.method POST for writing new data and PUT for update an existing data
	 * @param {object[]} [mPropertyBag.flexObjects] Objects to be written (i.e. change definitions, variant definitions etc.)
	 * @param {object} [mPropertyBag.flexObject] Object to be updated
	 * @param {string} mPropertyBag.url Configured url for the connector
	 * @param {string} [mPropertyBag.transport] The transport ID
	 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
	 * @param {boolean} [mPropertyBag.isAppVariant] indicator whether this is an app variant
	 * @param {boolean} [mPropertyBag.skipIam=false] - Indicates whether the default IAM item creation and registration is skipped. This is S4/Hana specific flag passed by only Smart Business
	 * @private
	 * @returns {Promise} Promise resolves as soon as the writing was completed
	 */
	var _doWrite = function(mPropertyBag) {
		var sRoute;
		if (mPropertyBag.isLegacyVariant) {
			sRoute = ROUTES.VARIANTS;
		} else if (mPropertyBag.isAppVariant) {
			sRoute = ROUTES.APPVARIANTS;
		} else {
			sRoute = ROUTES.CHANGES;
		}
		var mParameters = mPropertyBag.transport ? {changelist : mPropertyBag.transport} : {};
		if (mPropertyBag.skipIam) {
			mParameters.skipIam = mPropertyBag.skipIam;
		}

		ApplyConnector._addClientAndLanguageInfo(mParameters);
		//single update --> fileName needs to be in the url
		if (mPropertyBag.flexObject && !mPropertyBag.isAppVariant) {
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
		}
		var sWriteUrl = ApplyUtils.getUrl(sRoute, mPropertyBag, mParameters);
		delete mPropertyBag.reference;
		delete mPropertyBag.fileName;
		var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

		var oRequestOption = WriteUtils.getRequestOptions(
			ApplyConnector,
			sTokenUrl,
			mPropertyBag.flexObjects || mPropertyBag.flexObject,
			"application/json; charset=utf-8", "json"
		);
		return WriteUtils.sendRequest(sWriteUrl, mPropertyBag.method, oRequestOption);
	};

	var _prepareAppVariantSpecificChange = function(oAppVariant) {
		// Only content in the VENDOR layer have the real ABAP package
		// This check avoid sending ATO package to get transport info
		var sPackage = oAppVariant.getDefinition().layer === Layer.VENDOR ? oAppVariant.getPackage() : "";
		return new Change({
			fileName: oAppVariant.getDefinition().fileName,
			fileType: oAppVariant.getDefinition().fileType,
			packageName: sPackage,
			namespace: oAppVariant.getNamespace()
		});
	};

	var _selectTransportForAppVariant = function(mPropertyBag) {
		var oTransportSelectionPromise;
		if (mPropertyBag.transport) {
			oTransportSelectionPromise = Promise.resolve({transport: mPropertyBag.transport});
		} else {
			var oChange = _prepareAppVariantSpecificChange(mPropertyBag.appVariant);
			oTransportSelectionPromise = new TransportSelection().openTransportSelection(oChange);
		}
		return oTransportSelectionPromise.then(function (oTransportInfo) {
			if (oTransportInfo === "cancel") {
				return Promise.reject("cancel");
			}
			if (oTransportInfo && oTransportInfo.transport !== undefined) {
				return oTransportInfo.transport;
			}
			return Promise.reject(new Error("Transport information could not be determined"));
		});
	};

	var _handleSmartBusinessKPITileCreationCase = function(mPropertyBag) {
		if (
			!mPropertyBag.transport
			&& mPropertyBag.settings.isAtoEnabled()
			&& mPropertyBag.skipIam
			&& LayerUtils.isCustomerDependentLayer(mPropertyBag.layer)
		) {
			// Smart Business created KPI tiles on S4 Cloud and the query parameter will be added to support their usecase
			mPropertyBag.transport = "ATO_NOTIFICATION";
		}
	};

	/**
	 * Connector for requesting data from an LRep-based back end.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.LrepConnector
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var LrepConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.LrepConnector */ {

		layers: [
			"ALL"
		],

		/**
		 * Resets flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.changelist Transport Id
		 * @param {sap.ui.fl.Change[]} mPropertyBag.changes Changes of the selected layer and flex reference
		 * @param {string} [mPropertyBag.appVersion] Version of the application for which the reset takes place
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter (comma-separated list)
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset (comma-separated list)
		 * @returns {Promise} Promise resolves as soon as the reset has completed
		 */
		reset: function (mPropertyBag) {
			BusyIndicator.show(0); //Reset takes a long time with app descriptor changes, so a BusyIndicator is needed.
			var aChanges = [];
			var oTransportSelectionPromise = Promise.resolve(); //By default, no transport needed for USER layer

			if (mPropertyBag.layer !== Layer.USER) {
				aChanges = mPropertyBag.changes;
				oTransportSelectionPromise = Settings.getInstance().then(function (oSettings) {
					if (!oSettings.isProductiveSystem()) {
						return new TransportSelection().setTransports(aChanges, Component.get(mPropertyBag.reference)).then(function() {
							//Make sure we include one request in case of mixed changes (local and transported)
							aChanges.some(function(oChange) {
								if (oChange.getRequest()) {
									mPropertyBag.changelist = oChange.getRequest();
									return true;
								}
								return false;
							});
						});
					}
				});
			}

			return oTransportSelectionPromise.then(function() {
				BusyIndicator.show(0); //Re-display the busy indicator in case it was hide by transport selection
				var aParameters = ["reference", "layer", "appVersion", "changelist", "generator"];
				var mParameters = _pick(mPropertyBag, aParameters);

				ApplyConnector._addClientAndLanguageInfo(mParameters);

				if (mPropertyBag.selectorIds) {
					mParameters.selector = mPropertyBag.selectorIds;
				}
				if (mPropertyBag.changeTypes) {
					mParameters.changeType = mPropertyBag.changeTypes;
				}

				delete mPropertyBag.reference;
				var sResetUrl = ApplyUtils.getUrl(ROUTES.CHANGES, mPropertyBag, mParameters);
				var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);
				var oRequestOption = WriteUtils.getRequestOptions(
					ApplyConnector,
					sTokenUrl
				);
				return WriteUtils.sendRequest(sResetUrl, "DELETE", oRequestOption).then(function (oResponse) {
					BusyIndicator.hide();
					return oResponse;
				}).catch(function(oError) {
					BusyIndicator.hide();
					return Promise.reject(oError);
				});
			});
		},


		/**
		 * Publish flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {object} mPropertyBag.transportDialogSettings Settings for Transport dialog
		 * @param {object} mPropertyBag.transportDialogSettings.rootControl The root control of the running application
		 * @param {string} mPropertyBag.transportDialogSettings.styleClass Style class name to be added in the TransportDialog
		 * @param {string} mPropertyBag.layer Working layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.appVersion Version of the application for which the reset takes place
		 * @param {sap.ui.fl.Change[]} mPropertyBag.localChanges Local changes to  be published
		 * @param {object[]} [mPropertyBag.appVariantDescriptors] An array of app variant descriptors which needs to be transported
		 * @returns {Promise} Promise that resolves when all the artifacts are successfully transported
		 */
		publish: function (mPropertyBag) {
			var fnHandleAllErrors = function (oError) {
				BusyIndicator.hide();
				var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
				var sMessage = oResourceBundle.getText("MSG_TRANSPORT_ERROR", oError ? [oError.message || oError] : undefined);
				var sTitle = oResourceBundle.getText("HEADER_TRANSPORT_ERROR");
				Log.error("transport error" + oError);
				MessageBox.show(sMessage, {
					icon: MessageBox.Icon.ERROR,
					title: sTitle,
					styleClass: mPropertyBag.transportDialogSettings.styleClass
				});
				return "Error";
			};

			var oTransportSelection = new TransportSelection();
			return oTransportSelection.openTransportSelection(null, mPropertyBag.transportDialogSettings.rootControl, mPropertyBag.transportDialogSettings.styleClass)
				.then(function(oTransportInfo) {
					if (oTransportSelection.checkTransportInfo(oTransportInfo)) {
						BusyIndicator.show(0);
						var oContentParameters = {
							reference: mPropertyBag.reference,
							appVersion: mPropertyBag.appVersion,
							layer: mPropertyBag.layer
						};
						return oTransportSelection._prepareChangesForTransport(
							oTransportInfo,
							mPropertyBag.localChanges,
							mPropertyBag.appVariantDescriptors,
							oContentParameters
						).then(function() {
							BusyIndicator.hide();
						});
					}
					return "Cancel";
				})
				['catch'](fnHandleAllErrors);
		},

		/**
		 * Gets the flexibility info for a given application and layer.
		 * The flexibility info is a JSON string that has boolean properties 'isPublishEnabled' and 'isResetEnabled'
		 * that indicate if for the given application and layer a publish and reset shall be enabled, respectively
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise} Promise resolves as soon as flex info has been retrieved
		 */
		getFlexInfo: function (mPropertyBag) {
			var aParameters = ["layer", "appVersion"];
			var mParameters = _pick(mPropertyBag, aParameters);

			ApplyConnector._addClientAndLanguageInfo(mParameters);

			var sDataUrl = ApplyUtils.getUrl(ROUTES.FLEX_INFO, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl).then(function (oResult) {
				return oResult.response;
			});
		},

		/**
		 * Called to get the flex features.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @returns {Promise<object>} Promise resolves with an object containing the flex features
		 */
		loadFeatures: function (mPropertyBag) {
			if (ApplyConnector.settings) {
				return Promise.resolve(ApplyConnector.settings);
			}
			var mParameters = {};

			ApplyConnector._addClientAndLanguageInfo(mParameters);

			var sFeaturesUrl = ApplyUtils.getUrl(ROUTES.SETTINGS, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sFeaturesUrl).then(function (oResult) {
				return oResult.response;
			});
		},

		/**
		 * Write flex data into LRep back end; This method is called with a list of entities like changes, variants,
		 * control variants, variant changes and variant management changes.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object[]} mPropertyBag.flexObjects Objects to be written (i.e. change definitions, variant definitions etc.)
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		write:function (mPropertyBag) {
			mPropertyBag.method = "POST";
			return _doWrite(mPropertyBag);
		},

		/**
		 * Update an existing flex data stored in LRep back end.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObject Flex Object to be updated
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @returns {Promise} Resolves as soon as the writing is completed without data
		 */
		update: function (mPropertyBag) {
			if (mPropertyBag.flexObject.fileType === "variant") {
				mPropertyBag.isLegacyVariant = true;
			}
			mPropertyBag.method = "PUT";
			return _doWrite(mPropertyBag);
		},

		/**
		 * Delete an existing flex data stored in LRep back end.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObject Flex Object to be deleted
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise} Resolves as soon as the deletion is completed without data
		 */
		remove: function (mPropertyBag) {
			var mParameters = {
				namespace: mPropertyBag.flexObject.namespace,
				layer: mPropertyBag.flexObject.layer
			};
			if (mPropertyBag.transport) {
				mParameters.changelist = mPropertyBag.transport;
			}
			ApplyConnector._addClientAndLanguageInfo(mParameters);
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
			var sRoute = mPropertyBag.flexObject.fileType === "variant" ? ROUTES.VARIANTS : ROUTES.CHANGES;
			var sDeleteUrl = ApplyUtils.getUrl(sRoute, mPropertyBag, mParameters);
			//decode url before sending to ABAP back end which does not expect encoded special character such as "/" in the namespace
			sDeleteUrl = decodeURIComponent(sDeleteUrl);
			delete mPropertyBag.fileName;
			var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyConnector,
				sTokenUrl,
				undefined,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sDeleteUrl, "DELETE", oRequestOption);
		}
	});
	LrepConnector.applyConnector = ApplyConnector;

	LrepConnector.appVariant = {
		getManifest: function(mPropertyBag) {
			var sAppVariantManifestUrl = mPropertyBag.appVarUrl;
			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyConnector,
				undefined,
				undefined,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sAppVariantManifestUrl, "GET", oRequestOption);
		},
		load: function(mPropertyBag) {
			var sAppVariantUrl = ApplyUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag);
			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyConnector,
				undefined,
				undefined,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sAppVariantUrl, "GET", oRequestOption);
		},
		create: function(mPropertyBag) {
			_handleSmartBusinessKPITileCreationCase(mPropertyBag);
			mPropertyBag.method = "POST";
			mPropertyBag.isAppVariant = true;
			return _doWrite(mPropertyBag);
		},
		assignCatalogs: function(mPropertyBag) {
			var mParameters = {};
			mParameters.action = mPropertyBag.action;
			delete mPropertyBag.action;
			mParameters.assignFromAppId = mPropertyBag.assignFromAppId;
			delete mPropertyBag.assignFromAppId;

			var sCatalogAssignmentUrl = ApplyUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
			delete mPropertyBag.reference;
			var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyConnector,
				sTokenUrl,
				undefined,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sCatalogAssignmentUrl, "POST", oRequestOption);
		},
		unassignCatalogs: function(mPropertyBag) {
			var mParameters = {};
			mParameters.action = mPropertyBag.action;
			delete mPropertyBag.action;

			var sCatalogUnAssignmentUrl = ApplyUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
			delete mPropertyBag.reference;
			var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyConnector,
				sTokenUrl,
				undefined,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sCatalogUnAssignmentUrl, "POST", oRequestOption);
		},
		update: function(mPropertyBag) {
			return _selectTransportForAppVariant(mPropertyBag).then(function(sTransport) {
				if (sTransport) {
					mPropertyBag.transport = sTransport;
				}
				mPropertyBag.method = "PUT";
				mPropertyBag.isAppVariant = true;
				return _doWrite(mPropertyBag);
			});
		},
		remove: function(mPropertyBag) {
			return _selectTransportForAppVariant(mPropertyBag).then(function(sTransport) {
				var mParameters = {};
				if (sTransport) {
					mParameters.changelist = sTransport;
				}
				var sDeleteUrl = ApplyUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
				delete mPropertyBag.reference;
				var sTokenUrl = ApplyUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

				var oRequestOption = WriteUtils.getRequestOptions(
					ApplyConnector,
					sTokenUrl,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sDeleteUrl, "DELETE", oRequestOption);
			});
		},
		list: function(mPropertyBag) {
			var mParameters = {};

			mParameters.layer = mPropertyBag.layer;
			mParameters["sap.app/id"] = mPropertyBag.reference;

			delete mPropertyBag.layer;
			delete mPropertyBag.reference;

			var sAppVarOverviewUrl = ApplyUtils.getUrl(ROUTES.APPVARIANTS_OVERVIEW, mPropertyBag, mParameters);

			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyConnector,
				undefined,
				undefined,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sAppVarOverviewUrl, "GET", oRequestOption);
		}
	};

	return LrepConnector;
}, true);
