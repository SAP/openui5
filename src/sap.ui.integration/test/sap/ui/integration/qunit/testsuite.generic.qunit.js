sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.integration",
		objectCapabilities: {
			"sap.ui.integration.cards.CalendarContent": {
				create: function (CalendarContent, mParameters) {
					return new Promise(function (resolve, reject) {
						sap.ui.require(["sap/ui/model/json/JSONModel"], function (JSONModel) {
							var oCalendarContent = new CalendarContent(mParameters);
							oCalendarContent.setModel(new JSONModel(), "parameters");
							resolve(oCalendarContent);
						}, reject);
					});
				},
				aggregations: {
					appointments: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				}
			},
			"sap.ui.integration.cards.filters.SelectFilter": {
				properties: {
					config: GenericTestCollection.ExcludeReason.CantSetDefaultValue
				}
			}
		}
	});

	return oConfig;
});