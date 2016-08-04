sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("flexibleColumnLayout.Detail", {
		onInit: function () {
			this.bus = sap.ui.getCore().getEventBus();
		},
		handleDetailPress: function () {
			this.bus.publish("flexible", "setDetailDetailPage");
		},
		handleAddSnapped: function () {
			this.getView().byId("detailPage").getTitle().addSnappedContent(new sap.m.MessageStrip({text: "This is new snapped"}))
		},
		handleAddExpanded: function () {
			this.getView().byId("detailPage").getTitle().addExpandedContent(new sap.m.MessageStrip({text: "This is new expanded"}))
		},
		handleToggleFooterPress: function () {
			this.getView().byId("detailPage").setShowFooter(!this.getView().byId("detailPage").getShowFooter());
		},

		// Unified navigation via the bus - not all pages see the component/router directly
		handleNextPress: function () {
			this.bus.publish("flexible", "navigate", {pageName: "page2"});
		},
		handleBackPress: function () {
			this.bus.publish("flexible", "navigate", {pageName: "page1"});
		}
	});
}, true);
