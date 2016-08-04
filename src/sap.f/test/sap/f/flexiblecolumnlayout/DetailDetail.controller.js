sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("flexibleColumnLayout.DetailDetail", {
		onInit: function () {
			this.bus = sap.ui.getCore().getEventBus();
		},
		handleDetailDetailPress: function () {
			this.bus.publish("flexible", "navigate", {pageName: "page2"});
		},
		handleAddSnapped: function () {
			this.getView().byId("detailDetailPage").getTitle().addSnappedContent(new sap.m.MessageStrip({text: "This is new snapped"}))
		},
		handleAddExpanded: function () {
			this.getView().byId("detailDetailPage").getTitle().addExpandedContent(new sap.m.MessageStrip({text: "This is new expanded"}))
		},
		handleToggleFooterPress: function () {
			this.getView().byId("detailDetailPage").setShowFooter(!this.getView().byId("detailDetailPage").getShowFooter());
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
