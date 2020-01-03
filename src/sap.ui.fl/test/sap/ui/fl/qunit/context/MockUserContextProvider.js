/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/fl/context/BaseContextProvider"], function(BaseContextProvider) {
	"use strict";

	/**
	 * Context provider for testing purposes
	 *
	 * @class
	 * @extends sap.ui.fl.context.BaseContextProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var MockUserContextProvider = BaseContextProvider.extend("sap.ui.fl.qunit.context.MockUserContextProvider", {
		metadata : {
			text : {
				type : "String"
			},
			description : {
				type : "String"
			},
			domain : {
				type : "String"
			}
		}
	});

	MockUserContextProvider.prototype.loadData = function() {
		return Promise.resolve({
			settings : {
				language : "DE",
				TIME_ZONE : "CEST"
			},
			role : "admin"
		});
	};

	MockUserContextProvider.prototype.getValueHelp = function() {
		return Promise.resolve({
			timezone : {
				text : "Time Zone",
				description : "Time zones of a country the user lives in",
				values : [{
					text : "Central European Time ",
					description : "UTC+01:00 (CET)",
					value : "CET"
				}, {
					text : "The Pacific Time Zone",
					description : "The states on the Pacific coast, Nevada, and parts of Idaho",
					value : "PT"
				}]
			},
			language : {
				text : "Language",
				description : "Preferred language of the user",
				values : [{
					text : "German",
					description : "German language (Deutsch)",
					value : "DE"
				}, {
					text : "English",
					description : "American English",
					value : "EN_US"
				}]
			}
		});
	};

	return MockUserContextProvider;
});
