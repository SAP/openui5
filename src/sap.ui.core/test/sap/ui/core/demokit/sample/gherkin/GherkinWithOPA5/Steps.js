sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function(Log, StepDefinitions, Opa5, Press) {
	"use strict";

	var oOpa5 = new Opa5();

	/**
	 * @param {function} fnCallback - executed once the number of lemmings saved is determined.
	 *																Receives one parameter: "iNumberOfLemmingsSaved"
	 */
	function getNumberOfLemmingsSaved(fnCallback) {
		oOpa5.waitFor({
			id: "num-lemmings-saved",
			success: function(oLabel) {
				var sNumberOfLemmingsSaved = oLabel.getText().match(/Number of lemmings saved: (\d+)/)[1];
				var iNumberOfLemmingsSaved = parseInt(sNumberOfLemmingsSaved);
				fnCallback(iNumberOfLemmingsSaved);
			}
		});
	}

	var Steps = StepDefinitions.extend("GherkinWithOPA5.Steps", {
		init: function() {

			this.register(/^I have started the app$/i, function() {
				oOpa5.iStartMyAppInAFrame(sap.ui.require.toUrl("GherkinWithOPA5/Website.html"));
			});

			this.register(/^I can see the life saving button$/i, function() {
				oOpa5.waitFor({
					id: "life-saving-button",
					success: function(oButton) {
						Opa5.assert.strictEqual(oButton.getText(), "Save a Lemming",
							"Verified that we can see the life saving button");
					}
				});
			});

			this.register(/^I check how many lemmings have been saved already$/i, function() {
				getNumberOfLemmingsSaved(function(iNumberOfLemmingsSaved) {
					this.iNumLemmings = iNumberOfLemmingsSaved;
				}.bind(this));
			});

			this.register(/^I click on the life saving button\s*(\d*)?(?:\s*times)?$/i,
			function(sNumTimes) {
				var iNumTimes = (sNumTimes) ? parseInt(sNumTimes) : 1;
				for (var i = 0; i < iNumTimes; ++i) {
					oOpa5.waitFor({
						id: "life-saving-button",
						actions: new Press()
					});
				}
			});

			this.register(/^I save a lemming's life$/i, function() {
				getNumberOfLemmingsSaved(function(iNumberOfLemmingsSaved) {
					var iExpectedSavedLemmings = this.iNumLemmings + 1;
					Opa5.assert.strictEqual(iNumberOfLemmingsSaved, iExpectedSavedLemmings,
						"Verified correct number of lemmings saved");
				}.bind(this));
			});

			this.register(/^I can see the following named lemmings:$/i, function(aDataTable) {
				aDataTable.forEach(function(sLemmingName, iLemmingId) {
					oOpa5.waitFor({
						id: "lemming-name-" + (iLemmingId + 1),
						success: function(oLabel) {
							Opa5.assert.strictEqual(oLabel.getText(), sLemmingName,
								"Verified lemming: " + sLemmingName);
						}
					});
				});
			});

			this.register(/^I see (\w+) at the end of the list of named lemmings$/i, function(sName) {
				oOpa5.waitFor({
					id: "layout",
					success: function(oLayout) {
						var aContent = oLayout.getContent();
						var oLastContentItem = aContent[aContent.length - 1];
						Opa5.assert.strictEqual(oLastContentItem.getText(), sName,
							"Verified lemming: " + sName);
					}
				});
			});
		},

		closeApplication: function() {
			Log.info("Closing application");
		}
	});

	return Steps;

});