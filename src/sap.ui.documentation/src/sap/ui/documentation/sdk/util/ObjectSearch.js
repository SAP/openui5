/*!
 * ${copyright}
 */

// Provides a simple search feature
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		"use strict";


		var ObjectSearch = {

			getEntityPath : function (oData, sId) {
				if (!oData.entities) {
					return null;
				}
				var oResult = null;
				jQuery.each(oData.entities, function (i, oEnt) {
					if (oEnt.id === sId) {
						oResult = "/entities/" + i + "/";
						return false;
					}
				});
				return oResult;
			},

			/**
			 * Retrieves a single <code>Entity</code> object with the provided ID
			 * within the <code>ControlsInfo</code> entities.
			 * @param {Object} oData
			 * @param {Object} sEntityId
			 * @return {Object | null}
			 */
			getEntityById : function (oData, sEntityId) {
				var oEntity = null;

				oData && oData.entities && oData.entities.some(function (oEnt) {
					if (oEnt.id === sEntityId) {
						oEntity = oEnt;
						return true;
					}
				});

				return oEntity;
			}
		};

		return ObjectSearch;

	}, /* bExport= */ true);