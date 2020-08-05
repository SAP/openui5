/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils._BindingUtils.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Static collection of utility functions related to the binding of sap.ui.table.Table, ...
	 *
	 * Note: Do not access the functions of this helper directly, but via <code>sap.ui.table.utils.TableUtils.Binding...</code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.table.utils._BindingUtils
	 * @private
	 */
	var BindingUtils = {
		TableUtils: null, // Avoid cyclic dependency. Will be filled by TableUtils.

		/**
		 * Returns a promise for the loaded state of the metadata. If there is no rows binding or model, the promise will reject.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {Promise} A promise on the metadata loaded state.
		 */
		metadataLoaded: function(oTable) {
			var oBinding = oTable.getBinding("rows");
			var oModel = oBinding ? oBinding.getModel() : null;
			var fResolvePromise = null;
			var fRejectPromise = null;
			var pMetadataLoaded = new Promise(function(resolve, reject) {
				fResolvePromise = resolve;
				fRejectPromise = reject;
			});

			if (!oModel) {
				fRejectPromise();
				return pMetadataLoaded;
			}

			if (oModel.metadataLoaded) { // v2
				oModel.metadataLoaded().then(function() {
					fResolvePromise();
				});
			} else if (oModel.attachMetadataLoaded) { // v1
				if (oModel.oMetadata && oModel.oMetadata.isLoaded()) {
					fResolvePromise();
				} else {
					oModel.attachMetadataLoaded(function() {
						fResolvePromise();
					});
				}
			}

			return pMetadataLoaded;
		}
	};

	return BindingUtils;

}, /* bExport= */ true);