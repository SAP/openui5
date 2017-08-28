sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/iconexplorer/test/integration/pages/Common",
	"sap/ui/core/routing/HashChanger"
], function(Opa5, Common, HashChanger) {
	"use strict";

	Opa5.createPageObjects({
		onTheBrowser: {
			baseClass: Common,

			actions: {

				iPressOnTheBackwardsButton: function () {
					return this.waitFor({
						success: function () {
							// manipulate history directly for testing purposes
							history.back();
						}
					});
				},

				iPressOnTheForwardsButton: function () {
					return this.waitFor({
						success: function () {
							// manipulate history directly for testing purposes
							history.forward();
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
							var oHashChanger = HashChanger.getInstance();

							oHashChanger.setHash("/somethingInvalid");
						}
					});
				},

				iChangeTheHashParameter: function (sKey, sValue) {
					return this.waitFor({
						success: function () {
							var oHashChanger = HashChanger.getInstance(),
								sHash = oHashChanger.getHash(),
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
							oHashChanger.setHash(sHash);
						}
					});
				}
			},

			assertions: {}
		}

	});
});