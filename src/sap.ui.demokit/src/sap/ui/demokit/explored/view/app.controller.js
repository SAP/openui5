/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "sap/ui/core/Core", "sap/ui/core/Component", "sap/ui/core/mvc/Controller"], function (jQuery, Core, Component, Controller) {
	"use strict";

	return Controller.extend("sap.ui.demokit.explored.view.app", {

		onInit : function () {

			this._afterRenderingDone = false;

			// subscribe to app events
			this._component = Component.getOwnerComponentFor(this.getView());
			this._component.getEventBus().subscribe("app", "applyAppConfiguration", this._applyAppConfiguration, this);
			//load fake lrep lazy
			this.initFlex();
		},

		onAfterRendering : function () {
			if (this.hasOwnProperty("_compactOn")) {
				jQuery('body').toggleClass("sapUiSizeCompact", this._compactOn).toggleClass("sapUiSizeCozy", !this._compactOn);
			}
			if (this.hasOwnProperty("_themeActive") && !jQuery.sap.getUriParameters().get("sap-theme") && !jQuery.sap.getUriParameters().get("sap-ui-theme")) {
				sap.ui.getCore().applyTheme(this._themeActive);
			}
			this._afterRenderingDone = true;

		},

		_applyAppConfiguration : function(sChannel, sEvent, oData){
			if (this._afterRenderingDone){
				//handle themeChange
				sap.ui.getCore().applyTheme(oData.themeActive);
				//handle compact mode
				jQuery('body').toggleClass("sapUiSizeCompact", oData.compactOn).toggleClass("sapUiSizeCozy", !oData.compactOn);

				// apply theme and compact mode also to iframe samples
				var oSampleFrame = sap.ui.getCore().byId("sampleFrame");
				if (oSampleFrame) {
					var oSampleFrameContent = oSampleFrame.$()[0].contentWindow;
					if (oSampleFrameContent) {
						oSampleFrameContent.sap.ui.getCore().applyTheme(oData.themeActive);
						oSampleFrameContent.jQuery('body').toggleClass("sapUiSizeCompact", oData.compactOn).toggleClass("sapUiSizeCozy", !oData.compactOn);
					}
				}
			} else {
				this._themeActive = oData.themeActive;
				this._compactOn = oData.compactOn;
			}

		},
		_bFlexInitialized : false,
		initFlex: function() {
			if (!this._bFlexInitialized) {
				var that = this;
				setTimeout(function() {
					sap.ui.require(["sap/ui/fl/FakeLrepConnector","sap/ui/fl/Utils", "sap/ui/fl/descriptorRelated/api/Settings"], function(FakeLrepConnector, Utils, Settings) {
						if (!Utils || !FakeLrepConnector) {
							return;
						}

						Settings.prototype.isProductiveSystem = function() {
							return true; // not currently working to avoid transport button...
						};

						Utils.checkControlId = function() {
							return true;
						};

						// override FakeLrepConnector functions
						FakeLrepConnector.enableFakeConnector();
						FakeLrepConnector.prototype.create = function(payload, changeList, isVariant) {
							return Promise.resolve();
						};
						FakeLrepConnector.prototype.loadChanges = function(sComponentClassName) {
							return new Promise(function(resolve, reject) {
								var result = {
									changes: {},
									componentClassName: sComponentClassName
								};
								resolve(result);
							});
						};
						FakeLrepConnector.prototype.send = function(sUri, sMethod, oData, mOptions){
							return new Promise(function(resolve, reject){

							});
						};
						FakeLrepConnector.prototype.update = function(payload, changeName, changelist, isVariant) {
							return Promise.resolve();
						};
						FakeLrepConnector.prototype.deleteChange = function(params, isVariant) {
							return Promise.resolve({
								response: undefined,
								status: 'nocontent'
							});
						};
						that._bFlexInitialized = true;
					});
				}, 3000);
				return;
			}

		}
	});

});
