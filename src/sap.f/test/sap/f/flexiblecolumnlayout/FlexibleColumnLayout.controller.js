sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	var mode = "DP";

	return Controller.extend("flexibleColumnLayout.FlexibleColumnLayout", {
		onInit: function () {

			this.bus = sap.ui.getCore().getEventBus();
			this.bus.subscribe("flexible", "setDetailPage", this.setDetailPage, this);
			this.bus.subscribe("flexible", "setDetailDetailPage", this.setDetailDetailPage, this);

			this.oFlexibleColumnLayout = this.getView().byId("fcl");

			this.getOwnerComponent().getRouter().getRoute("fcl").attachPatternMatched(this.onRouteMatched, this);
		},

		onExit: function () {
			this.bus.unsubscribe("flexible", "setDetailPage", this.setDetailPage, this);
			this.bus.unsubscribe("flexible", "setDetailDetailPage", this.setDetailDetailPage, this);
		},

		loadMidView: function () {
			if (!this.detailView) {
				this.detailView = sap.ui.view({
					id: "midView",
					viewName: "flexibleColumnLayout.DetailOP",
					type: "XML"
				});
			}
			this.oFlexibleColumnLayout.setMidColumn(this.detailView);
			this.oFlexibleColumnLayout.setEndColumn(null);
		},

		loadEndView: function () {
			if (!this.detailDetailView) {
				this.detailDetailView = sap.ui.view({
					id: "endView",
					viewName: "flexibleColumnLayout.DetailDetail" + mode,
					type: "XML"
				});
			}
			this.oFlexibleColumnLayout.setEndColumn(this.detailDetailView);
		},

		// Lazy loader for the mid page - only on demand (when the user clicks)
		setDetailPage: function () {

			var sFullScreen = this.oFlexibleColumnLayout.getFullScreenColumn() || this.isMobileScenario() ? "fullScreen" : null;

			this.bus.publish("flexible", "navigate", {pageName: "fcl", view: "mid", fullscreen: sFullScreen});
		},

		// Lazy loader for the end page - only on demand (when the user clicks)
		setDetailDetailPage: function () {
			var sFullScreen = this.oFlexibleColumnLayout.getFullScreenColumn() || this.isMobileScenario() ? "fullScreen" : null;

			this.bus.publish("flexible", "navigate", {pageName: "fcl", view: "end", fullscreen: sFullScreen});
		},

		onRouteMatched: function (oEvent) {
			var sPage = oEvent.getParameters().arguments.view;
			var sFullScreen = oEvent.getParameters().arguments.fullscreen;

			if (!sPage) {
				this.oFlexibleColumnLayout.setMidColumn(null);
				this.oFlexibleColumnLayout.setEndColumn(null);
			} else if (sPage === "mid") {
				this.loadMidView();
			} else if (sPage === "end") {
				this.loadMidView();
				this.loadEndView();
			}

			if (sFullScreen) {
				this.oFlexibleColumnLayout.setFullScreenColumn(sPage + "View");
			} else {
				this.oFlexibleColumnLayout.setFullScreenColumn(null);
			}

			this.getPage("mid") && this.getPage("mid")._fsButton && this.getPage("mid")._fsButton.setIcon(sFullScreen ? "sap-icon://exit-full-screen" : "sap-icon://full-screen");
			this.getPage("end") && this.getPage("end")._fsButton && this.getPage("end")._fsButton.setIcon(sFullScreen ? "sap-icon://exit-full-screen" : "sap-icon://full-screen");
		},

		// The flexible column layout tells the app developer to manage the fullscreen button
		handleLayoutChange: function (oEvent) {
			var iBegin = oEvent.getParameter("beginColumnWidth"),
				iMid = oEvent.getParameter("midColumnWidth"),
				iEnd = oEvent.getParameter("endColumnWidth"),
				sLayout = iBegin + "/" + iMid + "/" + iEnd;

			//console.log("New layout is: ", sLayout);

			if (sLayout === "67/33/0" || sLayout === "33/67/0") {
				this.showHideButtons("mid", true);
			}

			if (sLayout === "25/50/25" || sLayout === "25/25/50" || sLayout === "0/67/33") {
				this.showHideButtons("mid", false);
				this.showHideButtons("end", true);
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
		showHideButtons: function (sPage, bShow) {
			var oPage = this.getPage(sPage);
			if (!oPage) {
				//console.log("Page not found");
				return;
			}

			// Create close button
			if (!oPage._clButton) {
				oPage._clButton = new sap.m.OverflowToolbarButton({
					icon: sap.ui.core.IconPool.getIconURI("decline"),
					layoutData: new sap.m.OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.NeverOverflow
					})
				});
				oPage._clButton.attachPress(this.handleCloseButtonPress.bind(this, sPage, oPage._clButton));
			}

			// Create fullscreen button
			if (!oPage._fsButton) {
				oPage._fsButton = new sap.m.OverflowToolbarButton({
					icon: sap.ui.core.IconPool.getIconURI("full-screen"),
					layoutData: new sap.m.OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.NeverOverflow
					})
				});
				oPage._fsButton.attachPress(this.handleFullScreenButtonPress.bind(this, sPage, oPage._fsButton));
			}

			if (mode == "DP") {

				// Add/remove close button
				if (bShow && oPage.getTitle().indexOfAction(oPage._clButton) === -1) {
					oPage.getTitle().addAction(oPage._clButton);
				} else if (!bShow && oPage.getTitle().indexOfAction(oPage._clButton) !== -1) {
					oPage.getTitle().removeAction(oPage._clButton);
				}

				// Add/remove fullscreen button
				if (bShow && oPage.getTitle().indexOfAction(oPage._fsButton) === -1) {
					oPage.getTitle().addAction(oPage._fsButton);
				} else if (!bShow && oPage.getTitle().indexOfAction(oPage._fsButton) !== -1) {
					oPage.getTitle().removeAction(oPage._fsButton);
				}

			} else {
				if (bShow && oPage.indexOfHeaderContent(oPage._fsButton) === -1) {
					oPage.addHeaderContent(oPage._fsButton);
				} else if (!bShow && oPage.indexOfHeaderContent(oPage._fsButton) !== -1) {
					oPage.removeHeaderContent(oPage._fsButton);
				}
			}
		},
		handleFullScreenButtonPress: function (sPage, oButton) {
			var sFullScreenColumnId;

			//console.log("Pressed fs button for ", sPage);

			// When exiting fullscreen, just navigate to the non-fullscreen layout
			if (this.oFlexibleColumnLayout.getFullScreenColumn()) {
				this.bus.publish("flexible", "navigate", {pageName: "fcl", view: sPage});
			} else {
				this.bus.publish("flexible", "navigate", {pageName: "fcl", view: sPage, fullscreen: "fullScreen"});
			}
		},
		handleCloseButtonPress: function (sPage, oButton) {
			console.log("Close", sPage)

			if (sPage === "mid") {
				this.bus.publish("flexible", "navigate", {pageName: "fcl"});
			} else {
				this.bus.publish("flexible", "navigate", {pageName: "fcl", view: "mid"});
			}
		},
		isMobileScenario: function () {
			return this.oFlexibleColumnLayout._getMaxColumns() === 1;
		}
	});
}, true);