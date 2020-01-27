sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5, Common) {
	"use strict";

	Opa5.createPageObjects({
		onTheBrowser : {

			actions : {

				iPressOnTheBackwardsButton : function () {
					return this.waitFor({
						success : function () {
							// manipulate history directly for testing purposes
							Opa5.getWindow().history.back();
						}
					});
				},

				iPressOnTheForwardsButton : function () {
					return this.waitFor({
						success : function () {
							// manipulate history directly for testing purposes
							Opa5.getWindow().history.forward();
						}
					});
				},

				iChangeTheHashToSomethingInvalid : function () {
					return this.waitFor({
						success : function () {
							Opa5.getHashChanger().setHash("reallyWrongHash");
						}
					});
				},

				iChangeTheHashToTheSpecificMember : function (iMemberId) {
					return this.waitFor({
						success : function () {
							Opa5.getHashChanger().setHash("memberCalendar/" + iMemberId);
						}
					});
				}

			},

			assertions: {}
		}

	});
});