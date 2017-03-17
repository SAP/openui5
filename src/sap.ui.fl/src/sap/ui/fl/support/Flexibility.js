/*!
 * ${copyright}
 */

// Provides class sap.ui.fl.support.Flexibility
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/support/Plugin",
		"sap/ui/core/support/Support",
		"sap/ui/model/json/JSONModel",
		"sap/ui/fl/Utils"
	],
	function (jQuery, Plugin, Support, JSONModel, Utils) {
		"use strict";

		/**
		 * Creates an instance of sap.ui.fl.support.Flexibility.
		 * @class This class represents the plugin for the support tool functionality of UI5.
		 * This class is internal and all its functions must not be used by an application
		 *
		 * @abstract
		 * @extends sap.ui.core.support.Plugin
		 * @version ${version}
		 * @sap-restricted
		 * @constructor
		 * @private
		 */
		var Flexibility = Plugin.extend("sap.ui.fl.support.Flexibility", {
			constructor: function (oSupportStub) {
					Plugin.apply(this, ["sapUiSupportFlexibility", "Flexibility", oSupportStub]);
					this._oStub = oSupportStub;

				if (this.runsAsToolPlugin()) {
					this._aEventIds = [
						this.getId() + "SetChanges"
					];
				} else {
					this._aEventIds = [
						this.getId() + "GetChanges"
					];
				}
			}
		});

		/**
		 * Creation of the support plugin.
		 * On tool plugin site a rendering as well as a model creation for later data receiving is created.
		 *
		 * @param {sap.ui.core.support.Support} oSupportStub - support instance created within the support window instantiation
		 */
		Flexibility.prototype.init = function (oSupportStub) {
			Plugin.prototype.init.apply(this, arguments);

			if (oSupportStub.isToolStub()) {
				this.addStylesheet("sap/ui/fl/support/flexibility");
				this.oModel = new JSONModel();
				this._renderToolPlugin();
			} else {
				// send data on initialization to the support panel
				this.onsapUiSupportFlexibilityGetChanges();
			}
		};

		/**
		 * Rendering of the tool plugin side of the UI.
		 * This creates a plain html-rendered header as well as a view containing the hierarchy of the flexibility data:
		 * 1 panel per flexibility cache entry
		 * - a table if changes are within the cache entry
		 * - a table if contexts are within the cache entry
		 *
		 * @private
		 */
		Flexibility.prototype._renderToolPlugin = function () {
			var that = this;

			var _doPlainRendering = function () {
				var rm = sap.ui.getCore().createRenderManager();
				rm.write("<div class='sapUiSupportToolbar'>");
				rm.write("<a href='#' id='" + that.getId() + "-Refresh' class='sapUiSupportLink'>Refresh</a>");
				that.$().on("click", '#' + that.getId() + "-Refresh", jQuery.proxy(that._onRefreshChanges, that));
				rm.write("</div>");
				rm.write("<div id='" + that.getId() + "-FlexCacheArea' class='sapUiSizeCompact' />");
				rm.flush(that.$().get(0));
				rm.destroy();
			};

			var _initView = function () {
				that.oView = sap.ui.view({viewName:"sap.ui.fl.support.Flexibility", type:sap.ui.core.mvc.ViewType.XML});
				that.oView.placeAt(that.getId() + "-FlexCacheArea");
				that.oView.setModel(that.oModel, "flex");
			};

			_doPlainRendering();
			_initView();
			this._onRefreshChanges();
		};

		/**
		 * Requests the data from the application
		 * @private
		 */
		 Flexibility.prototype._onRefreshChanges = function () {
			Support.getStub().sendEvent(this.getId() + "GetChanges", {});
		};


		/**
		 * Event handler called from the tool plugin side; prepares and sends flexibility data;
		 * the sap.ui.fl.Cache entries are read and passed back to the tool plugin.
		 */
		Flexibility.prototype.onsapUiSupportFlexibilityGetChanges = function () {

			var that = this;

			if (sap.ui.fl && sap.ui.fl.Cache) {
				var oCacheEntries = sap.ui.fl.Cache.getEntries();

				var oResult = [];
				var aPendingPromises = [];
				var aComponents = [];
				var aAppVersions = [];

				aComponents = Object.keys(oCacheEntries);
				aComponents.sort();
				aComponents.forEach(function (sFlexReference) {
					aAppVersions = Object.keys(oCacheEntries[sFlexReference]);
					aAppVersions.sort(function (sAppVersion1, sAppVersion2) {
						var fnNormalize = function(sAppVersion) {
							if (sAppVersion === Utils.DEFAULT_APP_VERSION) {
								return "000000000";
							}
							var aParts = sAppVersion.split(".");
							var sNormalizedAppVersion = "";
							aParts.forEach(function(sPart){
								sNormalizedAppVersion += ("000" + sPart).substring(sPart.length);
							});
							return sNormalizedAppVersion;
						};
						var sNormalizedAppVersion1 = fnNormalize(sAppVersion1);
						var sNormalizedAppVersion2 = fnNormalize(sAppVersion2);
						if (sNormalizedAppVersion1 < sNormalizedAppVersion2) {
							return -1;
						}
						if (sNormalizedAppVersion1 > sNormalizedAppVersion2) {
							return 1;
						}

						return 0;
					});
					aAppVersions.forEach(function(sAppVersion) {
						var oEntry = oCacheEntries[sFlexReference][sAppVersion];
						var aChanges = oEntry.file.changes.changes.slice(0);
						var aContexts = oEntry.file.changes.contexts.slice(0);

						if (aContexts.length > 0) {
							var oPromise = sap.ui.fl.context.ContextManager.getActiveContexts(aContexts).then(function (aActiveContexts) {
								aContexts.forEach(function (oContext) {
									oContext.isActive = aActiveContexts.indexOf(oContext.id) !== -1;
								});

								aChanges.forEach(function (oChange) {
									oChange.isActive = !oChange.context || aActiveContexts.indexOf(oChange.context) !== -1;
								});
							});
							oResult.push({
								reference: sFlexReference + " - " + sAppVersion,
								changes: aChanges,
								contexts: aContexts
							});

							aPendingPromises.push(oPromise);
						} else {
							aChanges.forEach(function (oChange) {
								oChange.isActive = !oChange.context;
							});

							oResult.push({
								reference: sFlexReference + " - " + sAppVersion,
								changes: aChanges,
								contexts: aContexts
							});
						}
					});
				});

				Promise.all(aPendingPromises).then(function () {
					that._oStub.sendEvent(that.getId() + "SetChanges", oResult);
				});
			} else {
				that._oStub.sendEvent(that.getId() + "SetChanges", {});
			}
		};

		/**
		 * Handler on tool plugin side; passes the received data from the application plugin tool to a model.
		 * @param oEvent
		 */
		Flexibility.prototype.onsapUiSupportFlexibilitySetChanges = function (oEvent) {
			var mCacheEntries = oEvent.getParameters();
			this.oModel.setData(mCacheEntries);
		};

		Flexibility.prototype.exit = function (oSupportStub) {
			Plugin.prototype.exit.apply(this, arguments);
		};

		return Flexibility;
	}
);
