sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheTopicMasterPage: {
			viewName: "TopicMaster",
			assertions: {
				iShouldSeeTheTopicMasterPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Topic Master page was successfully displayed");
						},
						errorMessage: "The Topic Master page was not displayed"
					});
				}
			}
		}
	});

});
