sap.ui.define([
	"sap/m/SplitContainer",
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/ui/core/mvc/Controller"
], function (SplitContainer, Device, Core, Controller) {
	"use strict";

	return Controller.extend("sap.f.sample.FlexibleColumnLayoutSimple.controller.FlexibleColumnLayout", {
		onInit: function () {
			this.bus = Core.getEventBus();
			this.bus.subscribe("flexible", "setDetailPage", this.setDetailPage, this);
			this.bus.subscribe("flexible", "setDetailDetailPage", this.setDetailDetailPage, this);

			this.oFlexibleColumnLayout = this.byId("fcl");
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
					viewName: "sap.f.sample.FlexibleColumnLayoutSimple.view.Detail",
					type: "XML"
				});
			}

			this.oFlexibleColumnLayout.addMidColumnPage(this.detailView);
			this.oFlexibleColumnLayout.setLayout(sap.f.LayoutType.TwoColumnsBeginExpanded);
		},

		// Lazy loader for the end page - only on demand (when the user clicks)
		setDetailDetailPage: function () {

			if (!this.detailDetailView) {
				this.detailDetailView = sap.ui.view({
					id: "endView",
					viewName: "sap.f.sample.FlexibleColumnLayoutSimple.view.DetailDetail",
					type: "XML"
				});
			}

			this.oFlexibleColumnLayout.addEndColumnPage(this.detailDetailView);
			this.oFlexibleColumnLayout.setLayout(sap.f.LayoutType.ThreeColumnsMidExpanded);
		}

	});
});