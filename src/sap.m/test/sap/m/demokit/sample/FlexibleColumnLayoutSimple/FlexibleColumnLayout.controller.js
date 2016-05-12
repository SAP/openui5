sap.ui.define([
	"sap/m/SplitContainer",
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller"
], function (SplitContainer, Device, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.FlexibleColumnLayoutSimple.FlexibleColumnLayout", {
		onInit: function () {
			this.bus = sap.ui.getCore().getEventBus();
			this.bus.subscribe("flexible", "setDetailPage", this.setDetailPage, this);
			this.bus.subscribe("flexible", "setDetailDetailPage", this.setDetailDetailPage, this);

			this.oFlexibleColumnLayout = this.getView().byId("fcl");
		},

		onExit: function () {
			this.bus.unsubscribe("flexible", "setDetailPage", this.setDetailPage, this);
			this.bus.unsubscribe("flexible", "setDetailDetailPage", this.setDetailDetailPage, this);
		},

		// Lazy loader for the mid page - only on demand (when the user clicks)
		setDetailPage: function () {

			if (!this.detailView) {
				this.detailView = sap.ui.view({
					id: "midView",
					viewName: "sap.m.sample.FlexibleColumnLayoutSimple.Detail",
					type: "XML"
				});
			}

			this.oFlexibleColumnLayout.setMidColumn(this.detailView);
			this.oFlexibleColumnLayout.setEndColumn(null);
		},

		// Lazy loader for the end page - only on demand (when the user clicks)
		setDetailDetailPage: function () {

			if (!this.detailDetailView) {
				this.detailDetailView = sap.ui.view({
					id: "endView",
					viewName: "sap.m.sample.FlexibleColumnLayoutSimple.DetailDetail",
					type: "XML"
				});
			}

			this.oFlexibleColumnLayout.setEndColumn(this.detailDetailView);
		}

	});
}, true);