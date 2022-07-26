/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/transport/TransportSelection",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Change",
	"sap/ui/core/Component",
	"sap/ui/core/BusyIndicator",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/base/util/restricted/_pick"
], function(
	merge,
	BaseConnector,
	InitialConnector,
	InitialUtils,
	WriteUtils,
	TransportSelection,
	Settings,
	Layer,
	LayerUtils,
	Utils,
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
		CONDENSE: "/actions/condense/",
		VARIANTS: "/variants/",
		SETTINGS: "/flex/settings",
		TOKEN: "/actions/getcsrftoken/",
		APPVARIANTS: "/appdescr_variants/",
		APPVARIANTS_OVERVIEW: "/app_variant_overview/",
		UI2PERSONALIZATION: "/ui2personalization/",
		CONTEXTS: "/flex/contexts/",
		VERSIONS: {
			GET: "/flex/versions/",
			ACTIVATE: "/flex/versions/activate/",
			DISCARD: "/flex/versions/draft/",
			PUBLISH: "/flex/versions/publish/"
		},
		MANI_FIRST_SUPPORTED: "/sap/bc/ui2/app_index/ui5_app_mani_first_supported"
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
	 * @param {boolean} [mPropertyBag.isAppVariant] Indicator whether this is an app variant
	 * @param {boolean} [mPropertyBag.isContextSharing] Indicator whether this is a request for context sharing
	 * @param {boolean} [mPropertyBag.skipIam=false] - Indicates whether the default IAM item creation and registration is skipped. This is S4/Hana specific flag passed by only Smart Business
	 * @param {boolean} [mPropertyBag.isCondensingEnabled] Indicator whether this is a request for condensing
	 * @param {boolean} [mPropertyBag.parentVersion] Indicates if changes should be written as a draft and on which version the changes should be based on
	 * @private
	 * @returns {Promise} Promise resolves as soon as the writing was completed
	 */
	var _doWrite = function(mPropertyBag) {
		var sRoute;
		if (mPropertyBag.isLegacyVariant) {
			sRoute = ROUTES.VARIANTS;
		} else if (mPropertyBag.isAppVariant) {
			sRoute = ROUTES.APPVARIANTS;
		} else if (mPropertyBag.isContextSharing) {
			sRoute = ROUTES.CONTEXTS;
		} else if (mPropertyBag.isCondensingEnabled) {
			sRoute = ROUTES.CONDENSE;
		} else {
			sRoute = ROUTES.CHANGES;
		}
		var mParameters = mPropertyBag.transport ? {changelist: mPropertyBag.transport} : {};
		if (mPropertyBag.skipIam) {
			mParameters.skipIam = mPropertyBag.skipIam;
		}
		if (mPropertyBag.parentVersion) {
			mParameters.parentVersion = mPropertyBag.parentVersion;
		}
		InitialUtils.addSAPLogonLanguageInfo(mParameters);
		InitialConnector._addClientInfo(mParameters);
		//single update --> fileName needs to be in the url
		if (mPropertyBag.flexObject && !mPropertyBag.isAppVariant) {
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
		}
		var sWriteUrl = InitialUtils.getUrl(sRoute, mPropertyBag, mParameters);
		delete mPropertyBag.reference;
		delete mPropertyBag.fileName;
		var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

		var oRequestOption = WriteUtils.getRequestOptions(
			InitialConnector,
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
		} else if (mPropertyBag.isForSmartBusiness) {
			return Promise.resolve();
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

	function renameVersionNumberProperty(oVersion) {
		oVersion.version = oVersion.versionId;
		delete oVersion.versionId;
		return oVersion;
	}

	/**
	 * Connector for requesting data from an LRep-based back end.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.LrepConnector
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	return merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.LrepConnector */ {
		initialConnector: InitialConnector,
		layers: InitialConnector.layers,
		/**
		 * Resets flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.changelist Transport Id
		 * @param {sap.ui.fl.Change[]} mPropertyBag.changes Changes of the selected layer and flex reference
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
						return new TransportSelection().setTransports(aChanges, Component.get(mPropertyBag.reference)).then(function () {
							//Make sure we include one request in case of mixed changes (local and transported)
							aChanges.some(function (oChange) {
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

			return oTransportSelectionPromise.then(function () {
				BusyIndicator.show(0); //Re-display the busy indicator in case it was hide by transport selection
				var aParameters = ["reference", "layer", "changelist", "generator"];
				var mParameters = _pick(mPropertyBag, aParameters);

				InitialConnector._addClientInfo(mParameters);

				if (mPropertyBag.selectorIds) {
					mParameters.selector = mPropertyBag.selectorIds;
				}
				if (mPropertyBag.changeTypes) {
					mParameters.changeType = mPropertyBag.changeTypes;
				}

				delete mPropertyBag.reference;
				var sResetUrl = InitialUtils.getUrl(ROUTES.CHANGES, mPropertyBag, mParameters);
				var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					sTokenUrl
				);
				return WriteUtils.sendRequest(sResetUrl, "DELETE", oRequestOption).then(function (oResponse) {
					if (oResponse && oResponse.response) {
						oResponse.response.forEach(function (oContentId) {
							oContentId.fileName = oContentId.name;
							delete oContentId.name;
						});
					}
					BusyIndicator.hide();
					return oResponse;
				}).catch(function (oError) {
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
		 * @param {sap.ui.fl.Change[]} mPropertyBag.localChanges Local changes to  be published
		 * @param {object[]} [mPropertyBag.appVariantDescriptors] An array of app variant descriptors which needs to be transported
		 * @returns {Promise<string>} Promise that can resolve to the following strings:
		 * - "Cancel" if publish process was canceled
		 * - <sMessage> when all the artifacts are successfully transported fl will return the message to show
		 * - "Error" in case of a problem
		 */
		publish: function (mPropertyBag) {
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");

			var fnHandleAllErrors = function (oError) {
				BusyIndicator.hide();
				var sMessage = oResourceBundle.getText("MSG_TRANSPORT_ERROR", oError ? [oError.message || oError] : undefined);
				var sTitle = oResourceBundle.getText("HEADER_TRANSPORT_ERROR");
				Log.error("transport error: " + oError);
				MessageBox.show(sMessage, {
					icon: MessageBox.Icon.ERROR,
					title: sTitle,
					styleClass: mPropertyBag.transportDialogSettings.styleClass
				});
				return "Error";
			};

			var oTransportSelection = new TransportSelection();
			return oTransportSelection.openTransportSelection(null, mPropertyBag.transportDialogSettings.rootControl, mPropertyBag.transportDialogSettings.styleClass)
			.then(function (oTransportInfo) {
				if (oTransportSelection.checkTransportInfo(oTransportInfo)) {
					BusyIndicator.show(0);
					var oContentParameters = {
						reference: mPropertyBag.reference,
						layer: mPropertyBag.layer
					};
					return oTransportSelection._prepareChangesForTransport(
						oTransportInfo,
						mPropertyBag.localChanges,
						mPropertyBag.appVariantDescriptors,
						oContentParameters
					).then(function () {
						BusyIndicator.hide();
						if (oTransportInfo.transport === "ATO_NOTIFICATION") {
							return oResourceBundle.getText("MSG_ATO_NOTIFICATION");
						}
						return oResourceBundle.getText("MSG_TRANSPORT_SUCCESS");
					});
				}
				return "Cancel";
			})['catch'](fnHandleAllErrors);
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
		 * @returns {Promise} Promise resolves as soon as flex info has been retrieved
		 */
		getFlexInfo: function (mPropertyBag) {
			var aParameters = ["layer"];
			var mParameters = _pick(mPropertyBag, aParameters);

			InitialConnector._addClientInfo(mParameters);

			var sDataUrl = InitialUtils.getUrl(ROUTES.FLEX_INFO, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sDataUrl, "GET", {initialConnector: InitialConnector}).then(function (oResult) {
				return oResult.response;
			});
		},

		/**
		 * Gets the variant management context information.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.type Type of context, currently only 'role' is supported
		 * @param {string} [mPropertyBag.$skip] Offset for paginated request
		 * @param {string} [mPropertyBag.$filter] Filters full raw data
		 * @returns {Promise<object>} Promise resolves as soon as context has been retrieved
		 */
		getContexts: function (mPropertyBag) {
			var aParameters = ["type", "$skip", "$filter"];
			var mParameters = _pick(mPropertyBag, aParameters);

			InitialConnector._addClientInfo(mParameters);

			var sContextsUrl = InitialUtils.getUrl(ROUTES.CONTEXTS, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sContextsUrl, "GET", {initialConnector: InitialConnector}).then(function (oResult) {
				return oResult.response;
			});
		},

		/**
		 * Loads the variant management context description in the correct language based on the browser configuration.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.flexObjects Payload for the post request
		 * @returns {Promise<object>} Promise resolves as soon as context descriptions have been retrieved
		 */
		loadContextDescriptions: function (mPropertyBag) {
			mPropertyBag.method = "POST";
			mPropertyBag.isContextSharing = true;
			return _doWrite(mPropertyBag).then(function (oResult) {
				return oResult.response;
			});
		},

		/**
		 * Check if context sharing is enabled in the backend.
		 *
		 * @returns {Promise<boolean>} Promise resolves with true
		 */
		isContextSharingEnabled: function () {
			return Promise.resolve(true);
		},

		/**
		 * Called to get the flex features.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @returns {Promise<object>} Promise resolves with an object containing the flex features
		 */
		loadFeatures: function (mPropertyBag) {
			if (InitialConnector.settings) {
				return Promise.resolve(InitialConnector.settings);
			}
			var mParameters = {};

			InitialConnector._addClientInfo(mParameters);

			var sFeaturesUrl = InitialUtils.getUrl(ROUTES.SETTINGS, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sFeaturesUrl, "GET", {initialConnector: InitialConnector}).then(function (oResult) {
				oResult.response.isVariantAdaptationEnabled = !!oResult.response.isPublicLayerAvailable;
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
		write: function (mPropertyBag) {
			mPropertyBag.method = "POST";
			return _doWrite(mPropertyBag);
		},

		/**
		 * Write flex data into LRep back end; This method is called with a map of condensed changes
		 * that also condense the stored changes on the backend.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObjects Map of condensed changes
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		condense: function (mPropertyBag) {
			mPropertyBag.method = "POST";
			mPropertyBag.isCondensingEnabled = true;
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
		 * @param {string} [mPropertyBag.parentVersion]  Indicates if changes should be written as a draft and on which version the changes should be based on
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
			if (mPropertyBag.parentVersion) {
				mParameters.parentVersion = mPropertyBag.parentVersion;
			}
			InitialConnector._addClientInfo(mParameters);
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
			var sRoute = mPropertyBag.flexObject.fileType === "variant" ? ROUTES.VARIANTS : ROUTES.CHANGES;
			var sDeleteUrl = InitialUtils.getUrl(sRoute, mPropertyBag, mParameters);
			//decode url before sending to ABAP back end which does not expect encoded special character such as "/" in the namespace
			sDeleteUrl = decodeURIComponent(sDeleteUrl);
			delete mPropertyBag.fileName;
			var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

			var oRequestOption = WriteUtils.getRequestOptions(
				InitialConnector,
				sTokenUrl,
				undefined,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sDeleteUrl, "DELETE", oRequestOption);
		},
		appVariant: {
			getManifirstSupport: function (mPropertyBag) {
				var sManifirstUrl = ROUTES.MANI_FIRST_SUPPORTED + "/?id=" + mPropertyBag.appId;
				return InitialUtils.sendRequest(sManifirstUrl, "GET", {initialConnector: InitialConnector}).then(function (oResponse) {
					return oResponse.response;
				});
			},
			getManifest: function (mPropertyBag) {
				var sAppVariantManifestUrl = mPropertyBag.appVarUrl;
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					Utils.getLrepUrl() + ROUTES.TOKEN,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sAppVariantManifestUrl, "GET", oRequestOption);
			},
			load: function (mPropertyBag) {
				var sAppVariantUrl = InitialUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag);
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					Utils.getLrepUrl() + ROUTES.TOKEN,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sAppVariantUrl, "GET", oRequestOption);
			},
			create: function (mPropertyBag) {
				mPropertyBag.method = "POST";
				mPropertyBag.isAppVariant = true;
				return _doWrite(mPropertyBag);
			},
			assignCatalogs: function (mPropertyBag) {
				var mParameters = {};
				mParameters.action = mPropertyBag.action;
				delete mPropertyBag.action;
				mParameters.assignFromAppId = mPropertyBag.assignFromAppId;
				delete mPropertyBag.assignFromAppId;

				var sCatalogAssignmentUrl = InitialUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
				delete mPropertyBag.reference;
				var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					sTokenUrl,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sCatalogAssignmentUrl, "POST", oRequestOption);
			},
			unassignCatalogs: function (mPropertyBag) {
				var mParameters = {};
				mParameters.action = mPropertyBag.action;
				delete mPropertyBag.action;

				var sCatalogUnAssignmentUrl = InitialUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
				delete mPropertyBag.reference;
				var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					sTokenUrl,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sCatalogUnAssignmentUrl, "POST", oRequestOption);
			},
			update: function (mPropertyBag) {
				return _selectTransportForAppVariant(mPropertyBag).then(function (sTransport) {
					if (sTransport) {
						mPropertyBag.transport = sTransport;
					}
					delete mPropertyBag.isForSmartBusiness;
					mPropertyBag.method = "PUT";
					mPropertyBag.isAppVariant = true;
					return _doWrite(mPropertyBag);
				});
			},
			remove: function (mPropertyBag) {
				return _selectTransportForAppVariant(mPropertyBag).then(function (sTransport) {
					var mParameters = {};
					if (sTransport) {
						mParameters.changelist = sTransport;
					}
					delete mPropertyBag.isForSmartBusiness;
					var sDeleteUrl = InitialUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
					delete mPropertyBag.reference;
					var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

					var oRequestOption = WriteUtils.getRequestOptions(
						InitialConnector,
						sTokenUrl,
						undefined,
						"application/json; charset=utf-8", "json"
					);
					return WriteUtils.sendRequest(sDeleteUrl, "DELETE", oRequestOption);
				});
			},
			list: function (mPropertyBag) {
				var mParameters = {};

				mParameters.layer = mPropertyBag.layer;
				mParameters["sap.app/id"] = mPropertyBag.reference;

				delete mPropertyBag.layer;
				delete mPropertyBag.reference;

				var sAppVarOverviewUrl = InitialUtils.getUrl(ROUTES.APPVARIANTS_OVERVIEW, mPropertyBag, mParameters);

				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					undefined,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sAppVarOverviewUrl, "GET", oRequestOption);
			}
		},
		ui2Personalization: {
			create: function (mPropertyBag) {
				mPropertyBag.initialConnector = this.initialConnector;
				var sPrefix = Utils.getLrepUrl();
				var oRequestOptions = WriteUtils.getRequestOptions(
					InitialConnector,
					sPrefix + ROUTES.TOKEN,
					mPropertyBag.flexObjects || mPropertyBag.flexObject,
					"application/json; charset=utf-8", "json"
				);
				var sUrl = sPrefix + ROUTES.UI2PERSONALIZATION;
				return WriteUtils.sendRequest(sUrl, "PUT", oRequestOptions);
			},
			remove: function (mPropertyBag) {
				mPropertyBag.initialConnector = this.initialConnector;
				var sUrl = InitialUtils.getUrl(ROUTES.UI2PERSONALIZATION, {
					url: Utils.getLrepUrl()
				}, {
					reference: mPropertyBag.reference,
					containerkey: mPropertyBag.containerKey,
					itemname: mPropertyBag.itemName
				});
				return WriteUtils.sendRequest(sUrl, "DELETE");
			}
		},
		versions: {
			load: function (mPropertyBag) {
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag)
				);
				var mParameters = {};
				InitialUtils.addSAPLogonLanguageInfo(mParameters);
				mParameters.limit = mPropertyBag.limit;
				var sVersionsUrl = InitialUtils.getUrl(ROUTES.VERSIONS.GET, mPropertyBag, mParameters);
				return WriteUtils.sendRequest(sVersionsUrl, "GET", oRequestOption).then(function (oResult) {
					return oResult.response.versions.map(function (oVersion) {
						return renameVersionNumberProperty(oVersion);
					});
				});
			},
			activate: function (mPropertyBag) {
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag),
					{title: mPropertyBag.title},
					"application/json; charset=utf-8",
					"json"
				);
				var mParameters = {version: mPropertyBag.version};
				InitialUtils.addSAPLogonLanguageInfo(mParameters);
				var sVersionsUrl = InitialUtils.getUrl(ROUTES.VERSIONS.ACTIVATE, mPropertyBag, mParameters);
				return WriteUtils.sendRequest(sVersionsUrl, "POST", oRequestOption).then(function (oResult) {
					var oVersion = oResult.response;
					return renameVersionNumberProperty(oVersion);
				});
			},
			discardDraft: function (mPropertyBag) {
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag)
				);
				var sVersionsUrl = InitialUtils.getUrl(ROUTES.VERSIONS.DISCARD, mPropertyBag);
				return WriteUtils.sendRequest(sVersionsUrl, "DELETE", oRequestOption);
			},
			publish: function (mPropertyBag) {
				var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");

				var fnHandleAllErrors = function (oError) {
					BusyIndicator.hide();
					var sMessage = oResourceBundle.getText("MSG_TRANSPORT_ERROR", oError ? [oError.message || oError] : undefined);
					var sTitle = oResourceBundle.getText("HEADER_TRANSPORT_ERROR");
					Log.error("transport error" + oError);
					MessageBox.show(sMessage, {
						icon: MessageBox.Icon.ERROR,
						title: sTitle,
						styleClass: mPropertyBag.styleClass
					});
					return "Error";
				};

				var oTransportSelection = new TransportSelection();
				return oTransportSelection.openTransportSelection(null, mPropertyBag.rootControl, mPropertyBag.styleClass, false)
				.then(function (oTransportInfo) {
					if (oTransportSelection.checkTransportInfo(oTransportInfo)) {
						BusyIndicator.show(0);

						if (!oTransportInfo.transport) {
							return Promise.reject(new Error("no transport provided as attribute of mParameters"));
						}
						if (!mPropertyBag.reference) {
							return Promise.reject(new Error("no reference provided as attribute of mParameters"));
						}
						if (!mPropertyBag.version) {
							return Promise.reject(new Error("no version provided as attribute of mParameters"));
						}

						var mParameters = {
							transport: oTransportInfo.transport,
							version: mPropertyBag.version
						};

						var sUrl = InitialUtils.getUrl(ROUTES.VERSIONS.PUBLISH, {
							url: Utils.getLrepUrl(),
							reference: mPropertyBag.reference
						}, mParameters);
						var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, {url: Utils.getLrepUrl()});

						var oRequestOption = WriteUtils.getRequestOptions(
							InitialConnector,
							sTokenUrl,
							undefined,
							"application/json; charset=utf-8", "json"
						);
						return WriteUtils.sendRequest(sUrl, "POST", oRequestOption)
						.then(function () {
							BusyIndicator.hide();
							if (oTransportInfo.transport === "ATO_NOTIFICATION") {
								return oResourceBundle.getText("MSG_ATO_NOTIFICATION");
							}
							return oResourceBundle.getText("MSG_TRANSPORT_SUCCESS");
						});
					}
					return "Cancel";
				})['catch'](fnHandleAllErrors);
			}
		}
	});
});
