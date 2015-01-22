sap.ui.require(
	[
		"sap/ui/demo/mdskeleton/model/MockableModel",
		"sap/m/List",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function(MockableModel, List) {
		"use strict";

		module("mock server tests", {
			setup: function () {
				sinon.config.useFakeTimers = false;
				this.oList =  new List();
				this.oList.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			teardown: function () {
				sinon.config.useFakeTimers = true;
				this.oMdSkeletonModel.destroy();
				this.oList.destroy();
			}
		});

		asyncTest("Should start up the mock server", function () {
			// Arrange
			this.stub(jQuery.sap, "getUriParameters", function () {
				return {
					get: function (sURIParameter) {
						// mock server test
						if (sURIParameter === "responderOn") {
							return "true";
						}
						return "1000";
					}
				}
			});
			this.oMdSkeletonModel = new MockableModel({
				serviceUrl: "../../../../../foo/",
				dataFolderName: "md_skeleton"
			});

			this.oList.attachUpdateFinished(function () {
				// Assert
				strictEqual(this.oList.getItems().length, 9, "The list shows the expected amount of products");

				start();
			}, this);

			// Act
			this.oList.setModel(this.oMdSkeletonModel);
			this.oList.bindItems({
				path : "/Objects",
				template :  new sap.m.StandardListItem({
					title: "{Name}"
				})
			});

		});
	}
);