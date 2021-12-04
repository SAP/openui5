sap.ui.define([
	"sap/f/library",
	"sap/m/SplitContainer",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView"
], function (fioriLibrary, SplitContainer, Controller, XMLView) {
	"use strict";

	var LayoutType = fioriLibrary.LayoutType;

	return Controller.extend("sap.f.sample.FlexibleColumnLayoutSimple.controller.FlexibleColumnLayout", {
		onInit: function () {
			this.bus = this.getOwnerComponent().getEventBus();
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
			this._loadView({
				id: "midView",
				viewName: "sap.f.sample.FlexibleColumnLayoutSimple.view.Detail"
			}).then(function(detailView) {
				this.oFlexibleColumnLayout.addMidColumnPage(detailView);
				this.oFlexibleColumnLayout.setLayout(LayoutType.TwoColumnsBeginExpanded);
			}.bind(this));
		},

		// Lazy loader for the end page - only on demand (when the user clicks)
		setDetailDetailPage: function () {
			this._loadView({
				id: "endView",
				viewName: "sap.f.sample.FlexibleColumnLayoutSimple.view.DetailDetail"
			}).then(function(detailDetailView) {
				this.oFlexibleColumnLayout.addEndColumnPage(detailDetailView);
				this.oFlexibleColumnLayout.setLayout(LayoutType.ThreeColumnsMidExpanded);
			}.bind(this));
		},

		// Helper function to manage the lazy loading of views
		_loadView: function(options) {
			var mViews = this._mViews = this._mViews || Object.create(null);
			if (!mViews[options.id]) {
				mViews[options.id] = this.getOwnerComponent().runAsOwner(function() {
					return XMLView.create(options);
				});
			}
			return mViews[options.id];
		}
	});
});