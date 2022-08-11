/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.BarcodeScannerDialog.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/BarcodeScannerDialog"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>BarcodeScannerDialog</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>BarcodeScannerDialog</code> component provides barcode scanning functionality for all devices that support the <code>MediaDevices.getUserMedia()</code> native API. Opening the dialog launches the device camera and scans for known barcode formats. <br>
	 * <br>
	 * A <code>scanSuccess</code> event fires whenever a barcode is identified and a <code>scanError</code> event fires when the scan failed (for example, due to missing permisions). <br>
	 * <br>
	 * Internally, the component uses the zxing-js/library third party OSS.
	 *
	 * For a list of supported barcode formats, see the {@link https://github.com/zxing-js/library zxing-js/library} documentation.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @experimental Since 1.95.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.BarcodeScannerDialog
	 */
	var BarcodeScannerDialog = WebComponent.extend("sap.ui.webc.fiori.BarcodeScannerDialog", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-barcode-scanner-dialog-ui5",
			events: {

				/**
				 * Fires when the scan fails with error.
				 */
				scanError: {
					parameters: {
						/**
						 * the error message
						 */
						message: {
							type: "string"
						}
					}
				},

				/**
				 * Fires when the scan is completed successfuuly.
				 */
				scanSuccess: {
					parameters: {
						/**
						 * the scan result as string
						 */
						text: {
							type: "string"
						},

						/**
						 * the scan result as a Uint8Array
						 */
						rawBytes: {
							type: "object"
						}
					}
				}
			},
			methods: ["close", "show"]
		}
	});

	/**
	 * Closes the dialog and the scan session.
	 * @public
	 * @name sap.ui.webc.fiori.BarcodeScannerDialog#close
	 * @function
	 */

	/**
	 * Shows a dialog with the camera videostream. Starts a scan session.
	 * @public
	 * @name sap.ui.webc.fiori.BarcodeScannerDialog#show
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return BarcodeScannerDialog;
});