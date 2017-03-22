sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/demo/iconexplorer/test/integration/pages/Common"
	], function(Opa5, Common) {
		"use strict";

		Opa5.createPageObjects({
			onTheBrowser: {
				baseClass: Common,

				actions: {

					iPressOnTheBackwardsButton: function () {
						return this.waitFor({
							success: function () {
								// manipulate history directly for testing purposes
								Opa5.getWindow().history.back();
							}
						});
					},

					iPressOnTheForwardsButton: function () {
						return this.waitFor({
							success: function () {
								// manipulate history directly for testing purposes
								Opa5.getWindow().history.forward();
							}
						});
					},

					iChangeTheHashToTheRememberedItem: function() {
						return this.waitFor({
							success: function() {
								var sIconName = this.getContext().currentItem.name;

								return this.iChangeTheHashParameter("icon", sIconName);
							}
						});
					},

					iChangeTheHashToSomethingInvalid: function () {
						return this.waitFor({
							success: function () {
								Opa5.getHashChanger().setHash("/somethingInvalid");
							}
						});
					},

					iChangeTheHashParameter: function (sKey, sValue) {
						return this.waitFor({
							success: function () {
								var sHash = Opa5.getHashChanger().getHash(),
									sHashParameter = sKey + "=" + sValue;
								if (sHash) {
									var oRegExp = new RegExp(sKey + "=[a-z0-9\-\_]+");
									if (sHash.match(oRegExp)) {
										sHash = sHash.replace(oRegExp, sHashParameter);
									} else {
										sHash += "&" + sHashParameter;
									}
								} else {
									sHash = "/?" + sHashParameter;
								}
								Opa5.getHashChanger().setHash(sHash);
							}
						});
					}
				},

				assertions: {}
			}

		});
	}
);