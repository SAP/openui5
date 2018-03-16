/*!
 * ${copyright}
 */

// Module provides access to functionality related to an S4HANA Cloud backend
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/odata/v2/ODataModel"
], function(ManagedObject, ODataModel) {
	"use strict";

	// Define managed object "S4HanaCloudBackend"
	var S4HanaCloudBackend = ManagedObject.extend("sap.ui.rta.appVariant.S4HanaCloudBackend", {

		constructor: function() {
			ManagedObject.apply(this, arguments);
		}

	});

	/**
	 * Notifies once FLP customzing for app is ready
	 *
	 * @param  {string}   sIamAppId             App id of identity access management
	 * @param  {function} fnIsReady             To be called once FLP customizing is ready: As a first parameter the IamAppId is given.
	 * @param  {int}      [iCheckIntervallMsec] Check intervall
	 * @param  {int}      [iMaxNumberOfChecks]  Maximum number of checks
	 * @return {Promise}  Either resolves with { iamAppId : sIamAppId, flpCustomizingIsReady : true | false }
	 *                    or rejects if the required ODATA service /sap/opu/odata/sap/APS_IAM_APP_SRV is not there
	 * @async
	 */
	S4HanaCloudBackend.prototype.notifyFlpCustomizingIsReady = function( sIamAppId, fnIsReady, iCheckIntervallMsec, iMaxNumberOfChecks ) {

		var that = this;
		return new Promise( function(resolve, reject) {

			// Check inputs and determine defaults
			function isNumeric(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
			var iMsec = isNumeric(iCheckIntervallMsec) ? iCheckIntervallMsec : 2500;
			var iRemainingChecks = isNumeric(iMaxNumberOfChecks) ? iMaxNumberOfChecks : -1;

			// Notification check
			function checkForNotification() {

				// No further checks if max number of checks done
				if (iRemainingChecks == 0) {
					resolve( { iamAppId : sIamAppId, flpCustomizingIsReady : false } );
					return;
				} else if (iRemainingChecks > 0) {
					iRemainingChecks = iRemainingChecks - 1;
				}

				// Check if FLP customizing is ready:
				that.checkFlpCustomizingIsReady( sIamAppId ).then( function( bIsReady ) {
				// ... Resolve promise if true
					if (bIsReady) {
						resolve( { iamAppId : sIamAppId, flpCustomizingIsReady : true } );
						fnIsReady( sIamAppId );
				// ... Continue checking if false
					} else {
						setTimeout( checkForNotification.bind(that), iMsec );
					}
				// ... Reject if OData service to check FLP customizing failed
				}).catch( function() {
						reject( { iamAppId : sIamAppId } );
				});
			}

			// Schedule first notification check
			setTimeout( checkForNotification.bind(that), iMsec );

		});
	};

	S4HanaCloudBackend._evaluateAppIntegrityEstimation = function( oAppIntegrityEstimation ) {

		// Acccess error messages of APS_IAM_APP_SRV ODATA service
		var aMessages =
			( oAppIntegrityEstimation && oAppIntegrityEstimation.AppStatusTable
			&& JSON.parse( oAppIntegrityEstimation.AppStatusTable ) &&
			JSON.parse( oAppIntegrityEstimation.AppStatusTable ).ITAB );

		// Confirm an array has been retrieved
		if (!Array.isArray(aMessages)) {
			throw (
				"Error: /sap/opu/odata/sap/APS_IAM_APP_SRV/checkAppIntegrity() returned unexpected result"
				+ "for IAM app ID " + oAppIntegrityEstimation.AppID
			);
		}

		// Check if publishing is in progress (Warning CM_APS_IAM_APP/057)
		var bCatalogPublishingInProgress =
			aMessages.filter( function(oMessage) {
				return (oMessage.TYPE == 'W' && oMessage.ID == "CM_APS_IAM_APP" && oMessage.NUMBER == "057");
			}).length >= 1;

		// Check if publishing failed (Error CM_APS_IAM_APP/058)
		var bCatalogPublishingFailed =
			aMessages.filter( function(oMessage) {
				return (oMessage.TYPE == 'E' && oMessage.ID == "CM_APS_IAM_APP" && oMessage.NUMBER == "058");
			}).length >= 1;

		// Check if errors have been reported
		var bErrorsReported =
			aMessages.filter( function(oMessage) {
				return ( oMessage.TYPE == 'E' );
			}).length >= 1;

		// Raise exception if pulishing catalog failed
		if ((bErrorsReported && !bCatalogPublishingInProgress) || bCatalogPublishingFailed) {
			throw (
				"Error: Tile generation for app variant with IAM app ID "
				+ oAppIntegrityEstimation.AppID + " failed"
			);
		}

		// Customizing is "ready" if publishing is finished, there are no error messages and AppStatus is empty
		return ( !bCatalogPublishingInProgress && !bErrorsReported && !oAppIntegrityEstimation.AppStatus );

	};

	/**
	 * Tells if the FLPD customizing has been generated for the Fiori app with the given IAM app ID
	 *
	 * @param  {string} sIamAppId Identity Access Management ID of the Fiori app
	 * @return {Promise<boolean>} Promise delivering a boolean value
	 * @async
	 *
	 * Remarks:
	 * <ul>
	 * 		<li>
	 * 		In order to check if the FLP customizing for a IAM app ID is available,
	 * 		the function import checkAppIntegrity of the OData Service APS_IAM_APP_SRV is used.
	 *
	 * 		As Sebastian Scheuermann said, this is an inoffcial SAP internal API and it's not
	 *   	documented. Everything is okay if the AppStatus is initial. Then also the AppStatusTable
	 *   	property has an empty ITAB property with an empty table.
	 *    	</li>
	 * </ul>
	 */
	S4HanaCloudBackend.prototype.checkFlpCustomizingIsReady = function( sIamAppId ) {

		return new Promise( function( resolve, reject ) {


			// Access IAM app OData service and confirm that metadat have been loaded
			// ... Remark:
			//     I do not keep the model as a reusable service as then the attached functions
			//     may accumulate with multiple notifyFlpCustomizingIsReady calls.
			var oModel = new ODataModel("/sap/opu/odata/sap/APS_IAM_APP_SRV");
			oModel.attachMetadataFailed( function( error ) {
				reject( error );
			});

			// Check integrity of IAM app
			oModel.metadataLoaded().then( function() {
				oModel.callFunction( "/checkAppIntegrity",
					{ method:"POST", urlParameters:{ AppID:sIamAppId },
					  error: reject,
					  success: resolve
					}
				);
			});
/*
			// Unfortunately, the following code is not supported:
			// Reject is not called, if the metadata cold not be retrieved.
			// From my perspective this is an error.

			try {
				new ODataModel("/sap/opu/odata/sap/APS_IAM_APP_SRV").callFunction( "/checkAppIntegrity",
					{ method:"POST", urlParameters:{ AppID:sIamAppId },
					  error: reject,
					  success: resolve }
				);
			} catch ( error ) {
				reject( error );
			}
*/
		}).then( S4HanaCloudBackend._evaluateAppIntegrityEstimation );

	};

	return S4HanaCloudBackend;
});

