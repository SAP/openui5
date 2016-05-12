sap.ui.define([
	"sap/m/SplitContainer",
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller"
], function (SplitContainer, Device, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.FlexibleColumnLayoutDynamicPage.FlexibleColumnLayout", {
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
					id: "midViewDP",
					viewName: "sap.m.sample.FlexibleColumnLayoutDynamicPage.DetailDP",
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
					id: "endViewDP",
					viewName: "sap.m.sample.FlexibleColumnLayoutDynamicPage.DetailDetailDP",
					type: "XML"
				});
			}

			this.oFlexibleColumnLayout.setEndColumn(this.detailDetailView);
		},

		// The flexible column layout tells the app developer to manage the fullscreen button
		handleLayoutChange: function (oEvent) {
			var iBegin = oEvent.getParameter("beginColumnWidth"),
				iMid = oEvent.getParameter("midColumnWidth"),
				iEnd = oEvent.getParameter("endColumnWidth"),
				sLayout = iBegin + "/" + iMid + "/" + iEnd;

			if (sLayout === "67/33/0" || sLayout === "33/67/0") {
				this.handleFullScreenButton("mid", true);
			}

			if (sLayout === "25/50/25" || sLayout === "25/25/50" || sLayout === "0/67/33") {
				this.handleFullScreenButton("mid", false);
				this.handleFullScreenButton("end", true);
			}
		},


		getPage: function (sPage) {
			if (sPage === "begin") {
				return this.byId("beginView").byId("masterPage");
			} else if (sPage === "mid") {
				return this.detailView ? this.detailView.byId("detailPage") : undefined;
			} else if (sPage === "end") {
				return this.detailDetailView ? this.detailDetailView.byId("detailDetailPage") : undefined;
			}
		},

		// Makes the given page show/hide the full screen button
		handleFullScreenButton: function (sPage, bShow) {
			var oPage = this.getPage(sPage);
			if (!oPage) {
				//console.log("Page not found");
				return;
			}
			if (!oPage._fsButton) {
				oPage._fsButton = new sap.m.OverflowToolbarButton({
					icon: sap.ui.core.IconPool.getIconURI("full-screen"),
					layoutData: new sap.m.OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.NeverOverflow
					})
				});
				oPage._fsButton.attachPress(this.handleFullScreenButtonPress.bind(this, sPage, oPage._fsButton));
			}

			if (bShow && oPage.getTitle().indexOfAction(oPage._fsButton) === -1) {
				oPage.getTitle().addAction(oPage._fsButton);
			} else if (!bShow && oPage.getTitle().indexOfAction(oPage._fsButton) !== -1) {
				oPage.getTitle().removeAction(oPage._fsButton);
			}

		},
		handleFullScreenButtonPress: function (sPage, oButton) {
			var sFullScreenColumnId;

			//console.log("Pressed fs button for ", sPage);

			// If some of the columns is in full screen mode, turn it off
			if (this.oFlexibleColumnLayout.getFullScreenColumn()) {
				sFullScreenColumnId = null;
				// Pass the respective view's id as the association
			} else {
				sFullScreenColumnId = sPage + "View";
			}

			this.oFlexibleColumnLayout.setFullScreenColumn(sFullScreenColumnId);

			oButton.setIcon(oButton.getIcon() === "sap-icon://full-screen" ? "sap-icon://exit-full-screen" : "sap-icon://full-screen");
		}
	});
}, true);