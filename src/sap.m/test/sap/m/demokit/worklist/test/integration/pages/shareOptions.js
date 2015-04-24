sap.ui.define([],
	function() {
		"use strict";

		return {
			createActions: function (sViewName) {
				return {
					iPressOnTheShareButton: function () {
						return this.waitFor({
							id: "shareButton",
							viewName: sViewName,
							success: function (oButton) {
								oButton.$().trigger("tap");
							},
							errorMessage: "Did not find the share button"
						});
					}
				};
			},
			createAssertions: function (sViewName) {
				return {
					iShouldSeeTheShareEmailButton: function () {
						return this.waitFor({
							id: "shareEmail",
							viewName: sViewName,
							success: function () {
								ok(true, "The E-Mail button is visible");
							},
							errorMessage: "The E-Mail button was not found"
						});
					},

					iShouldSeeTheShareTileButton: function () {
						return this.waitFor({
							id: "shareTile",
							viewName: sViewName,
							success: function () {
								ok(true, "The Save as Tile button is visible");
							},
							errorMessage: "The Save as Tile  button was not found"
						});
					},

					iShouldSeeTheShareJamButton: function () {
						return this.waitFor({
							id: "shareJam",
							viewName: sViewName,
							success: function () {
								ok(true, "The Jam share button is visible");
							},
							errorMessage: "The Jam share button was not found"
						});
					}
				};
			}
		};
	}
);

