/*!
 * ${copyright}
 */

// Provides class sap.ui.fl.support.Flexibility
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/support/Plugin",
		"sap/ui/core/support/Support",
		"sap/ui/model/json/JSONModel",
		"sap/ui/fl/FlexController",
		"sap/ui/fl/ChangePersistenceFactory",
		"sap/ui/fl/Utils"
	],
	function (jQuery, Plugin, Support, JSONModel, FlexController, ChangePersistenceFactory, Utils) {
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
						this.getId() + "SetApps",
						this.getId() + "SetChangesMaps"
					];
				} else {
					this._aEventIds = [
						this.getId() + "GetApps",
						this.getId() + "GetChangesMaps"
					];
				}
			}
		});

		Flexibility.prototype.sDelimiter = ";";
		Flexibility.prototype.sNoDebug = "noDebug";

		/**
		 * Creation of the support plugin.
		 * On tool plugin site a rendering as well as a model creation for later data receiving is created.
		 *
		 * @param {sap.ui.core.support.Support} oSupportStub - support instance created within the support window instantiation
		 */
		Flexibility.prototype.init = function (oSupportStub) {
			Plugin.prototype.init.apply(this, arguments);

			var sNoDebugInfoText = "<div class='sapUiSmallMargin'>sapui5 has to be in <b>debug mode</b> or at least the " +
				"library \'<b> sap.ui.fl</b>\' has to be debugged.</div>" +
				"<div class='sapUiSmallMargin'>To set the debug sources use the URL parameter '<b>sap-ui-debug</b> " +
				"with general debug setting <b>sap-ui-debug=true</b> or to debug single libraries by naming the libraries " +
				"<b>sap-ui-debug=lib1, lib2, ...</b> (including '<b>sap.ui.fl</b>').</div>" +
				"<div class='sapUiSmallMargin'>Another option is to enable the debugging in this 'Diagnostics' window by " +
				"toggle the <b>Debug Sources</b> under the <b>Technical Info</b> panel.</div>";

			if (oSupportStub.isToolStub()) {
				this.addStylesheet("sap/ui/fl/support/flexibility");
				this.oChangesModel = new JSONModel();
				this.oAppModel = new JSONModel();
				this.oToolSettings = new JSONModel({
					hideDependingChanges: false,
					flInDebug: true,
					noDebugInfoText: sNoDebugInfoText
				});
				this.oChangeDetails = new JSONModel();
				this._renderToolPlugin([]);

				Support.getStub().sendEvent(this.getId() + "GetApps", {});
			} else {
				// send data on initialization to the support panel
				this.onsapUiSupportFlexibilityGetApps();
			}
		};

		/**
		 * Rendering of the tool plugin side of the UI.
		 * This creates a plain html-rendered header as well as a view containing the hierarchy of the flexibility data:
		 * - Hierarchical List of controls and their changes
		 * - details View with information to selected changes
		 *
		 * @private
		 */
		Flexibility.prototype._renderToolPlugin = function () {
			var that = this;

			var _doPlainRendering = function () {
				var rm = sap.ui.getCore().createRenderManager();
				rm.write("<div id='" + that.getId() + "-FlexCacheArea' class='sapUiSizeCompact' />");
				rm.flush(that.$().get(0));
				rm.destroy();
			};

			var _initView = function () {
				that.oView = sap.ui.view({
					viewName: "sap.ui.fl.support.diagnostics.Flexibility",
					type: sap.ui.core.mvc.ViewType.XML,
					viewData: {
						plugin: that
					}
				});
				that.oView.placeAt(that.getId() + "-FlexCacheArea");
				that.oView.setModel(that.oAppModel, "flexApps");
				that.oView.setModel(that.oToolSettings, "flexToolSettings");
				that.oView.setModel(that.oChangesModel, "flexChanges");
				that.oView.setModel(that.oChangeDetails, "flexChangeDetails");
			};

			_doPlainRendering();
			_initView();
		};

		/**
		 * Sends a request to synchronize the tool window with the running applications;
		 * The function is called after filling the app list (with the first item) or user selection of an app.
		 *
		 * @param {string} sAppKey Concatenated application name and version
		 *
		 * @private
		 * @restricted sap.ui.fl.support
		 */
		Flexibility.prototype._onAppSelected = function (sAppKey) {
			Support.getStub().sendEvent(this.getId() + "GetChangesMaps", {appKey: sAppKey});
		};

		/**
		 * Requests the data from the application side support plugin
		 *
		 * @private
		 * @restricted sap.ui.fl.support
		 */
		 Flexibility.prototype.onRefresh = function () {
			 Support.getStub().sendEvent(this.getId() + "GetApps", {});
		};

		/**
		 * Collect list of apps
		 */
		Flexibility.prototype.onsapUiSupportFlexibilityGetApps = function () {
			// only provide data in case the debug collected these
			if (Utils.isDebugEnabled()) {
				var that = this;
				var aApps = [];

				if (ChangePersistenceFactory._instanceCache) {
					jQuery.each(ChangePersistenceFactory._instanceCache, function (sReference, mInstancesOfVersions) {
						Object.keys(mInstancesOfVersions).forEach(function (sVersion) {
							aApps.push({
								key : sReference + that.sDelimiter + sVersion,
								text : sReference,
								additionalText : sVersion
							});
						});
					});
				}

				this._oStub.sendEvent(this.getId() + "SetApps", aApps);
			} else {
				this._oStub.sendEvent(this.getId() + "SetApps", this.sNoDebug);
			}
		};

		/**
		 * Collect data of changes
		 *
		 * @param {sap.ui.base.Event} oEvent Event sent from the tool side plugin to request changes
		 *
		 */
		Flexibility.prototype.onsapUiSupportFlexibilityGetChangesMaps = function (oEvent) {
			var sAppKey = oEvent.mParameters.appKey;
			var aAppParameters = sAppKey.split(this.sDelimiter);
			var sAppName = aAppParameters[0];
			var sAppVersion = aAppParameters[1];
			this._getChangesMapForApp(sAppName, sAppVersion);
		};

		/**
		 * Handler on tool plugin side; passes the received data from the application plugin tool to a model.
		 *
		 * @param {sap.ui.base.Event} oEvent Event sent from the application side plugin with the applications
		 */
		Flexibility.prototype.onsapUiSupportFlexibilitySetApps = function (oEvent) {
			var mApps = oEvent.getParameters();

			var bFlInDebug = mApps !== this.sNoDebug;
			this.oToolSettings.setProperty("/flInDebug", bFlInDebug);

			if (bFlInDebug) {
				this.oAppModel.setData(mApps);

				var oAppSelection = this.oView.byId("appSelection");
				var oFirstItem = oAppSelection.getItems()[0];
				oAppSelection.setSelectedItem(oFirstItem);
				oAppSelection.fireChange({selectedItem : oFirstItem});
			}
		};

		/**
		 * Handler on tool plugin side; passes the received data from the application plugin tool to a model.
		 *
		 * @param {sap.ui.base.Event} oEvent Event sent from the application side plugin with the changes
		 */
		Flexibility.prototype.onsapUiSupportFlexibilitySetChangesMaps = function (oEvent) {
			var mCacheEntries = oEvent.getParameters();
			this.oChangesModel.setData(mCacheEntries);
			// show all changes by expanding the tree after model update (which hides all sub-nodes)
			this.oView.byId("Tree").expandToLevel(1000);
		};

		Flexibility.prototype.exit = function (oSupportStub) {
			Plugin.prototype.exit.apply(this, arguments);
		};

		/**
		 * Collect data of changes
		 *
		 * @param {string} sAppName Name of the application
		 * @param {string} sAppVersion Version of the application
		 *
		 * @private
		 */
		Flexibility.prototype._getChangesMapForApp = function (sAppName, sAppVersion) {
			function _collectChangesData(mChanges, sControlId) {
				mChangedControls[sControlId] = [];
				var aChangesForControl = mChangeFromPersistence[sControlId];
				var oControl = sap.ui.getCore().byId(sControlId);
				var aAppliedChanges = [];
				var aFailedChangesJs = [];
				var aFailedChangesXml = [];
				if (oControl) {
					if (oControl.data(FlexController.appliedChangesCustomDataKey)) {
						aAppliedChanges = oControl.data(FlexController.appliedChangesCustomDataKey).split(",");
					}
					if (oControl.data(FlexController.failedChangesCustomDataKeyJs)) {
						aFailedChangesJs = oControl.data(FlexController.failedChangesCustomDataKeyJs).split(",");
					}
					if (oControl.data(FlexController.failedChangesCustomDataKeyXml)) {
						aFailedChangesXml = oControl.data(FlexController.failedChangesCustomDataKeyXml).split(",");
					}
				}

				mChangedControls[sControlId] = aChangesForControl.map(_collectDataForSingleChange.bind(this, oControl, aAppliedChanges, aFailedChangesJs, aFailedChangesXml, mChanges));
			}

			function _collectDataForSingleChange(oControl, aAppliedChanges, aFailedChangesJs, aFailedChangesXml, mChanges, oChange) {
				var oChangeDetails = {
					id : oChange.getId(),
					changeType : oChange.getChangeType(),
					selector : oChange.getSelector(),
					controlPresent : !!oControl,
					indexInAppliedChanges : undefined,
					indexOfFirstFailing : undefined,
					dependentControls : [], // filled later
					dependentChanges : [], // filled later
					someDirectDependingChangesFailed : false, // filled later
					someDirectDependingChangesNotApplied : false, // filled later
					isInSubTree : false // filled later
				};

				var aAllFailedChanges = aFailedChangesJs.concat(aFailedChangesXml);

				if (oChangeDetails.controlPresent && aAppliedChanges.indexOf(oChange.getId()) > -1) {
					oChangeDetails.indexInAppliedChanges = aAppliedChanges.indexOf(oChange.getId());
				}
				if (oChangeDetails.controlPresent && aFailedChangesJs.indexOf(oChange.getId()) > -1) {
					oChangeDetails.modifier = "JS";
					oChangeDetails.indexOfFirstFailing = aAllFailedChanges.indexOf(oChange.getId());
				}
				if (oChangeDetails.controlPresent && aFailedChangesXml.indexOf(oChange.getId()) > -1) {
					oChangeDetails.modifier = "XML";
					oChangeDetails.indexOfFirstFailing = aAllFailedChanges.indexOf(oChange.getId());
				}

				if (oChange._aDependentIdList) {
					oChangeDetails.dependentControls = oChange._aDependentIdList.map(function (sDependentId) {
						return {
							id : sDependentId,
							controlPresent : !!sap.ui.getCore().byId(sDependentId)
						};
					});
				}

				mChanges[oChange.getId()] = oChangeDetails;

				return oChangeDetails;
			}

			function _setIsInSubTreeInformation(oChangeDetails, sKey, oDependency) {
				var aChangeIds = oDependency.dependencies;
				if (aChangeIds.indexOf(oChangeDetails.id) !== -1) {
					var bSameSelector = JSON.stringify(mChanges[sKey].selector) === JSON.stringify(oChangeDetails.selector);
					oChangeDetails.isInSubTree = oChangeDetails.isInSubTree || bSameSelector;
				}
			}

			function _setDependentChangeRelatedInformation(sControlId, mChangesOnControl) {
				mChangesOnControl.forEach(function (oChangeDetails) {
					jQuery.each(mDependencies, _setIsInSubTreeInformation.bind(this, oChangeDetails));

					oChangeDetails.allDependendingControlsPresent = oChangeDetails.dependentControls.every(function (mControl) {
						return mControl.controlPresent;
					});

					if (mDependencies[oChangeDetails.id] && mDependencies[oChangeDetails.id].dependencies) {
						mDependencies[oChangeDetails.id].dependencies.forEach(function (sDependentChangeId) {
							var oDependentChange = mChanges[sDependentChangeId];
							var bDependentChangeNotApplied = oDependentChange.indexInAppliedChanges == undefined;
							var oDependentChange = mChanges[sDependentChangeId];
							oChangeDetails.someDirectDependingChangesNotApplied =
								oChangeDetails.someDirectDependingChangesNotApplied || bDependentChangeNotApplied;
							var bDependentChangeFailed = oDependentChange.indexOfFirstFailing == undefined;
							var bDependentChangesUnsuccessfulApplied = bDependentChangeFailed && bDependentChangeNotApplied;

							oChangeDetails.someDirectDependingChangesFailed = oChangeDetails.someDirectDependingChangesFailed
								|| bDependentChangeFailed;
							oChangeDetails.someDirectDependingChangesNotSuccessfulApplied =
								oChangeDetails.someDirectDependingChangesNotSuccessfulApplied || bDependentChangesUnsuccessfulApplied;
							oChangeDetails.dependentChanges.push(oDependentChange);
						});
					}

					oChangeDetails.isApplicable = !oChangeDetails.someDirectDependingChangesNotApplied &&
						oChangeDetails.controlPresent && oChangeDetails.allDependendingControlsPresent &&
						!oChangeDetails.someDirectDependingChangesNotApplied;

					oChangeDetails.isPossibleRootCause = oChangeDetails.isApplicable && oChangeDetails.indexInAppliedChanges == undefined;
				});
			}

			function _fnCreateChangesNode(aChangesDetails) {
				aChangesDetails = aChangesDetails.filter(function (oChange) {
					return !aChangesDetails.some(function (oChangeInSameHierarchy) {
						return oChangeInSameHierarchy.dependentChanges.some(function (oDependentChange) {
							return oDependentChange.id == oChange.id;
						});
					});
				});

				return aChangesDetails.map(function (oChange) {
					return {
						id: oChange.id,
						text: oChange.changeType,
						nodes: oChange.dependentChanges ? _fnCreateChangesNode(oChange.dependentChanges) : []
					};
				});
			}

			function _createRootNodes(sControlId, aChangesDetails) {
				aTreeNodes.push({
					text: sControlId,
					nodes: _fnCreateChangesNode(aChangesDetails)
				});
			}

			var mChanges = {};
			var mChangedControls = {};
			var aTreeNodes = [];
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppName, sAppVersion);
			var mChangeFromPersistence = oChangePersistence._mChanges.mChanges;
			var mDependencies = oChangePersistence._mChangesInitial.mDependencies;

			Object.keys(mChangeFromPersistence).forEach(_collectChangesData.bind(this, mChanges));
			jQuery.each(mChangedControls, _setDependentChangeRelatedInformation);
			jQuery.each(mChangedControls, _createRootNodes);

			this._oStub.sendEvent(this.getId() + "SetChangesMaps", {
				changes: mChanges,
				tree: aTreeNodes
			});
		};

		return Flexibility;
	}
);
