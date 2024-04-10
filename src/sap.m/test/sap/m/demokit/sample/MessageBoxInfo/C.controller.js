sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";

	return Controller.extend("sap.m.sample.MessageBoxInfo.C", {

		onShowTextInfo: function () {
			MessageBox.information("Information", {
				title: "Information",
				id: "messageBoxId1",
				details: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
				contentWidth: "100px",
				styleClass: sResponsivePaddingClasses,
				dependentOn: this.getView()
			});
		},

		onShowFormattedTextInfo: function () {
			MessageBox.error("Unable to load data.", {
				title: "Error",
				id: "messageBoxId2",
				details: "<p><strong>This can happen if:</strong></p>" +
					"<ul>" +
					"<li>You are not connected to the internet</li>" +
					"<li>a backend component is not <em>available</em></li>" +
					"<li>or an underlying system is down</li>" +
					"</ul>" +
					"<p>Get more help <a href='//www.sap.com' target='_top'>here</a>.",
				contentWidth: "100px",
				styleClass: sResponsivePaddingClasses,
				dependentOn: this.getView()
			});
		},

		onShowJSONInfo: function () {
			var oData = {
				glossary: {
					title: "example glossary"
				}
			};
			MessageBox.error("Error message", {
				title: "Error",
				id: "messageBoxId3",
				details: oData,
				contentWidth: "100px",
				styleClass: sResponsivePaddingClasses,
				dependentOn: this.getView()
			});
		},

		onShowTextInfoAsync: function () {
			MessageBox.information("Information", {
				title: "Information",
				id: "messageBoxId4",
				details: function () {
					return new Promise(function (resolve, reject) {
						setTimeout(function () {
							resolve("Asynchronously fetched details");
						}, 2000); // Simulate network request delay
					});
				},
				contentWidth: "100px",
				styleClass: sResponsivePaddingClasses,
				dependentOn: this.getView()
			});
		}

	});
});