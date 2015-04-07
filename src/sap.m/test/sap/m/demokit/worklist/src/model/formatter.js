sap.ui.define([
	"sap/m/Text"
], function (Text) {
	"use strict";

	return {
		/**
		 * Rounds the number unit value to 2 digits
		 *
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},

		/**
		 * Returns a configuration object for the {@link sap.ushell.ui.footerbar.AddBookMarkButton} "appData" property
		 *
		 * @public
		 * @param {string} sTitle the title for the "save as tile" dialog
		 * @returns {object} the configuration object
		 */
		shareTileData: function(sTitle) {
			return {
				title: sTitle
			};
		},

		/**
		 * Returns a configuration object for the {@link sap.ushell.ui.footerbar.JamShareButton} "jamData" property
		 *
		 * @public
		 * @param {string} sTitle the title for the "share on SAP Jam" dialog
		 * @returns {object} the configuration object
		 */
		shareJamData : function (sTitle) {
			return {
				object: {
					id: window.location.href,
					display: new Text({text: sTitle}),
					share: ""
				}
			};
		}
	};

});
