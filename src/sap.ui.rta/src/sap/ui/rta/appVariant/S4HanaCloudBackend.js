/*!
 * ${copyright}
 */

// Module provides access to functionality related to an S4HANA Cloud backend
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/odata/v2/ODataModel"
], function(
	ManagedObject,
	ODataModel
) {
	"use strict";
	var oModelPromise;

	// Define managed object "S4HanaCloudBackend"
	var S4HanaCloudBackend = ManagedObject.extend("sap.ui.rta.appVariant.S4HanaCloudBackend", {
		constructor: function() {
			ManagedObject.apply(this, arguments);
		}
	});

	/**
	 * Notifies once customizing for app is ready
	 *
	 * @param  {string}   sIamAppId             App id of identity access management
	 * @param  {boolean}  bAppVarCreation		Boolean value indicating that app variant is being created
	 * @param  {int}      [iCheckIntervallMsec] Check intervall
	 * @param  {int}      [iMaxNumberOfChecks]  Maximum number of checks
	 * @return {Promise}  Either resolves with { iamAppId : sIamAppId, customizingIsReady : true | false }
	 *                    or rejects if the required ODATA service /sap/opu/odata/sap/APS_IAM_APP_SRV is not there
	 * @async
	 */
	S4HanaCloudBackend.prototype.notifyFlpCustomizingIsReady = function(sIamAppId, bAppVarCreation, iCheckIntervallMsec, iMaxNumberOfChecks) {
		var that = this;
		return new Promise(function(resolve, reject) {
			// Check inputs and determine defaults
			function isNumeric(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
			var iMsec = isNumeric(iCheckIntervallMsec) ? iCheckIntervallMsec : 2500;
			var iRemainingChecks = isNumeric(iMaxNumberOfChecks) ? iMaxNumberOfChecks : -1;

			function checkForNotification() {
				// No further checks if max number of checks done
				if (iRemainingChecks === 0) {
					resolve({ iamAppId : sIamAppId, customizingIsReady : false });
					return;
				} else if (iRemainingChecks > 0) {
					iRemainingChecks = iRemainingChecks - 1;
				}

				this.checkCatalogCustomizingIsReady(sIamAppId, bAppVarCreation).then(function(bIsReady) {
				// ... Resolve promise if true
					if (bIsReady) {
						resolve({ iamAppId : sIamAppId, customizingIsReady : true });
				// ... Continue checking if false
					} else {
						setTimeout(checkForNotification.bind(that), iMsec);
					}
				// ... Reject if OData service to check customizing failed
				}).catch(function(oError) {
					jQuery.sap.log.error(oError);
					reject({ iamAppId : sIamAppId });
				});
			}

			// Schedule first notification check
			setTimeout(checkForNotification.bind(that), iMsec);
		});
	};

	S4HanaCloudBackend._isAppReady = function(oAppStatusResponse, bAppVarCreation) {
		// access catalog assignment information of APS_IAM_APP_SRV ODATA service
		var aCatalogList = oAppStatusResponse.data.results;

		// confirm an array has been retrieved
		if (!Array.isArray(aCatalogList)) {
			throw new Error(oAppStatusResponse.requestUri + " returned unexpected result: " + oAppStatusResponse);
		}

		var bIsUnpublished = aCatalogList.every(function(oCatalog) {
			// ActualStatus === 1 : Unpublished
			return oCatalog.ActualStatus === 1;
		});

		var bIsPublished = aCatalogList.every(function(oCatalog) {
			// ActualStatus === 2 : Published
			return oCatalog.ActualStatus === 2;
		});

		var bErrorsReported = aCatalogList.some(function(oCatalog) {
			// ActualStatus === 5 : Error, ActualStatus === 4 : Locked
			return oCatalog.ActualStatus === 5 || oCatalog.ActualStatus === 4;
		});

		if (bErrorsReported) {
			var sText = bAppVarCreation ? "creation" : "deletion";
			throw new Error("Catalog failed for app variant " + sText);
		}

		return bAppVarCreation ? bIsPublished : bIsUnpublished;
	};

	S4HanaCloudBackend._getODataModel = function() {
		if (!oModelPromise) {
			oModelPromise = new Promise(function(resolve, reject) {
				var oModel = new ODataModel("/sap/opu/odata/sap/APS_IAM_APP_SRV");
				oModel.attachMetadataFailed(function(oError) {
					reject(oError);
					oModelPromise = null;
				});
				oModel.metadataLoaded().then(function() {
					resolve(oModel);
				});
			});
		}
		return oModelPromise;
	};

	S4HanaCloudBackend._readODataModel = function(oModel, sIamAppId) {
		return new Promise(function(resolve, reject) {
			var fnSuccess = function(oData, oResponse) {
				resolve(oResponse);
			};
			var fnFailure = function(oError) {
				reject(oError);
			};

			return oModel.read("/aps_iam_app_ddl('" + sIamAppId + "')/to_BusinessCatalogAssignment", {success: fnSuccess, error: fnFailure});
		});
	};


	/**
	 * Polls the OData model to check catalog publishing status of the given IAM app ID.
	 *
	 * @param  {string} sIamAppId Identity Access Management ID of SAP Fiori app
	 * @return {Promise<boolean>} Promise delivering a boolean value
	 * @async
	 */
	S4HanaCloudBackend.prototype.checkCatalogCustomizingIsReady = function(sIamAppId, bAppVarCreation) {
		return S4HanaCloudBackend._getODataModel()
			.then(function(oModel) {
				return S4HanaCloudBackend._readODataModel(oModel, sIamAppId);
			})
			.then(function(oAppStatusResponse) {
				return S4HanaCloudBackend._isAppReady(oAppStatusResponse, bAppVarCreation);
			});
	};

	return S4HanaCloudBackend;
});

