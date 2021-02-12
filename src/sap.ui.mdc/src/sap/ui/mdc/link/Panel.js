/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/core/XMLComposite',
	'sap/ui/mdc/library',
	'sap/m/HBox',
	'sap/m/VBox',
	'sap/m/Text',
	'sap/m/Image',
	'sap/m/Link',
	'sap/ui/core/CustomData',
	'sap/base/Log',
	'sap/m/SelectDialog',
	'sap/m/StandardListItem',
	'sap/ui/mdc/link/SelectionDialog',
	'sap/ui/mdc/link/SelectionDialogItem',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/BindingMode',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/mdc/flexibility/PanelItem.flexibility',
	'sap/ui/mdc/flexibility/Panel.flexibility',
	"sap/ui/core/syncStyleClass"
], function(XMLComposite, mdcLibrary, HBox, VBox, Text, Image, Link, CustomData, Log, SelectDialog, StandardListItem, SelectionDialog, SelectionDialogItem, JSONModel, BindingMode, ManagedObjectObserver, PanelItemFlexibility, PanelFlexibility, syncStyleClass) {
	"use strict";

	/**
	 * Constructor for a new Panel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The Panel control is used to show <code>items</code> and <code>additionalContent</code>. After providing of the <code>items</code> it is
	 * supposed that the properties of the item structure is not changed.
	 * @extends sap.ui.core.XMLComposite
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.54.0
	 * @alias sap.ui.mdc.link.Panel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Panel = XMLComposite.extend("sap.ui.mdc.link.Panel", /** @lends sap.ui.mdc.link.Panel.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/link/Panel.designtime",
			defaultAggregation: "items",
			properties: {
				/**
				 * As the Panel control does not know whether items aggregation is filled completely, the user of the control has
				 * to define the visibility of the personalization button.
				 */
				enablePersonalization: {
					type: "boolean",
					defaultValue: true,
					invalidate: true
				},
				/**
				 * Path to the helper object which is responsible for metadata providing.
				 */
				metadataHelperPath: {
					type: "string"
				},
				/**
				 * Function that is called before the actual navigation happens. This function has to return a promise resolving into a Boolean value for
				 *  which the navigation will wait. If the Boolean value is <code>true</code>, the navigation will be processed.
				 */
				beforeNavigationCallback: {
					type: "function"
				}
			},
			aggregations: {
				/**
				 * Defines items.
				 * Items which are filled at the beginning (meaning before the selection dialog is opened) are considered as the baseline items.
				 */
				items: {
					type: "sap.ui.mdc.link.PanelItem",
					multiple: true,
					singularName: "item"
				},
				/**
				 * In addition to items some additional content can be displayed in the panel.
				 */
				additionalContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						idSuffix: "--idSectionAdditionalContent",
						aggregation: "items"
					}
				}
			},
			events: {
				/**
				 * This event is fired before selection dialog is opened.
				 */
				beforeSelectionDialogOpen: {},
				/**
				 * This event is fired after selection dialog is closed.
				 */
				afterSelectionDialogClose: {}
			}
		}
	});
	Panel.prototype.init = function() {
		XMLComposite.prototype.init.call(this);
		var oModel = new JSONModel({
			// disjunct sets
			countAdditionalContent: 0,
			countItemsWithIcon: 0,
			countItemsWithoutIcon: 0,

			showResetEnabled: false,

			// Additionally the property 'icon' can be modified in 'runtimeItems'.
			runtimeItems: [],
			contentTitle: ""
		});
		oModel.setDefaultBindingMode(BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapuimdclinkPanel");

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));
		this._oObserver.observe(this, {
			properties: [
				"enablePersonalization"
			],
			aggregations: [
				"items",
				"additionalContent"
			]
		});
	};

	Panel.prototype.applySettings = function() {
		XMLComposite.prototype.applySettings.apply(this, arguments);
		var oModel = this._getInternalModel();
		oModel.setProperty("/countAdditionalContent", this.getAdditionalContent().length);
	};

	Panel.prototype.exit = function(oControl) {
		if (this._oObserver) {
			this._oObserver.disconnect();
			this._oObserver = null;
		}
	};

	Panel.prototype.onPressLink = function(oEvent) {
		if (this.getBeforeNavigationCallback() && oEvent.getParameter("target") !== "_blank") {
			var sHref = oEvent.getParameter("href");
			oEvent.preventDefault();
			this.getBeforeNavigationCallback()(oEvent).then(function(bNavigate) {
				if (bNavigate) {
					window.location.href = sHref;
				}
			});
		}
	};

	Panel.prototype.onPressLinkPersonalization = function() {
		this.openSelectionDialog(false, true, undefined);
	};

	Panel.prototype.openSelectionDialog = function(bForbidNavigation, bShowReset, sStyleClass) {
		return sap.ui.getCore().loadLibrary('sap.ui.fl', {
			async: true
		}).then(function() {
			sap.ui.require([
				'sap/ui/fl/write/api/ControlPersonalizationWriteAPI', 'sap/ui/fl/apply/api/FlexRuntimeInfoAPI', this.getMetadataHelperPath() || "sap/ui/mdc/Link"
			], function(ControlPersonalizationWriteAPI, FlexRuntimeInfoAPI, MetadataHelper) {

				// If the condition, that a control is assigned to a AppComponent is not fulfilled, we can go ahead
				if (!FlexRuntimeInfoAPI.isFlexSupported({element: this})) {
					Log.error("No AppComponent fount for control " + this + ". Without AppComponent the personalization is not available.");
					return Promise.resolve();
				}
				// Otherwise we wait until the changes are applied
				return FlexRuntimeInfoAPI.waitForChanges({element: this}).then(function() {

					return new Promise(function(resolve) {
						var aAllLinkItems = MetadataHelper.retrieveAllMetadata(this);

						var bShowDefaultIcon = aAllLinkItems.some(function(oMItem) {
							return !!oMItem.icon;
						});
						var aMRuntimeItems = jQuery.extend(true, [], this._getInternalModel().getProperty("/runtimeItems"));

						var aMBaselineItems = MetadataHelper.retrieveBaseline(this);
						// TODO: add KEYUSER changed items
						var aMBaselineItemsTotal = aMBaselineItems;
						this._getInternalModel().setProperty("/baselineItems", aMBaselineItemsTotal);

						var fnCleanUp = function(oSelectionDialog) {
							oSelectionDialog.close();
							oSelectionDialog.destroy();
							this.fireAfterSelectionDialogClose();
						}.bind(this);
						var aRuntimeChanges = [];
						var fnAddRuntimeChange = function(sId, bVisible) {
							aRuntimeChanges.push({
								id: sId,
								visible: bVisible
							});
						};

						var fnUpdateResetButton = function(oSelectionDialog) {
							var bShowResetEnabled = Panel._showResetButtonEnabled(aMBaselineItemsTotal, oSelectionDialog.getItems());
							this._getInternalModel().setProperty("/showResetEnabled", bShowResetEnabled);
						};

						this.fireBeforeSelectionDialogOpen();

						var bUnconfirmedResetPressed = false;

						var oSelectionDialog = new SelectionDialog({
							showItemAsLink: !bForbidNavigation,
							showReset: bShowReset,
							showResetEnabled: {
								path: '$selectionDialog>/showResetEnabled'
							},
							items: aAllLinkItems.map(function(oMItem) {
								// Overwrite metadata with the current values
								var oMItemRuntime = Panel._getItemById(oMItem.id, aMRuntimeItems);
								var bIsBaseline = this._isItemBaseline(oMItem);
								var sIcon = oMItem.icon;
								if (bShowDefaultIcon && !sIcon) {
									sIcon = "sap-icon://chain-link";
								}
								return new SelectionDialogItem({
									key: oMItem.id, // convert id to key
									text: oMItem.text,
									description: oMItem.description,
									href: oMItem.href,
									target: oMItem.target,
									icon: sIcon,
									visible: oMItemRuntime ? oMItemRuntime.visible : false,
									isBaseline: bIsBaseline
								});
							}.bind(this)),
							visibilityChanged: function(oEvent) {
								// convert key to id
								var sId = oEvent.getParameter("key");
								fnAddRuntimeChange(sId, oEvent.getParameter("visible"));
								fnUpdateResetButton.call(this, oEvent.getSource());
							}.bind(this),
							ok: function() {
								var that = this;
								var fnCreateChanges = function() {
									var aPanelChanges = PanelFlexibility.createChanges(that, aRuntimeChanges);
									var aFlexChangesTotal = [];
									ControlPersonalizationWriteAPI.add({
										changes: aPanelChanges,
										ignoreVariantManagement: true
									}).then(function(aFlexChanges) {
										aFlexChangesTotal = aFlexChangesTotal.concat(aFlexChanges);
										// Then use the new item instance as selector control
										var aPanelItemChanges = PanelItemFlexibility.createChanges(aRuntimeChanges);
										return ControlPersonalizationWriteAPI.add({
											changes: aPanelItemChanges,
											ignoreVariantManagement: true
										});
									}).then(function(aFlexChanges) {
										aFlexChangesTotal = aFlexChangesTotal.concat(aFlexChanges);
										return ControlPersonalizationWriteAPI.save({
											selector: that,
											changes: aFlexChangesTotal
										});
									}).then(function() {
										fnCleanUp(oSelectionDialog);
										return resolve(true);
									});
								};

								if (bUnconfirmedResetPressed) {
									ControlPersonalizationWriteAPI.reset({selectors: this.getItems()}).then(function() {
										fnCreateChanges();
									});
								} else {
									fnCreateChanges();
								}
							}.bind(this),
							cancel: function() {
								fnCleanUp(oSelectionDialog);
								return resolve(true);
							},
							reset: function() {
								aRuntimeChanges = [];
								bUnconfirmedResetPressed = true;
							}
						});
						if (sStyleClass) {
							oSelectionDialog.addStyleClass(sStyleClass);
						}
						fnUpdateResetButton.call(this, oSelectionDialog);

						// toggle compact style
						syncStyleClass("sapUiSizeCompact", this, oSelectionDialog);
						oSelectionDialog.setModel(this._getInternalModel(), "$selectionDialog");
						this.addDependent(oSelectionDialog);

						oSelectionDialog.open();
					}.bind(this));
				}.bind(this));

			}.bind(this));
		}.bind(this));
	};

	Panel._showResetButtonEnabled = function(aMBaseLineItems, aSelectionDialogItems) {
		var bShowResetButtonEnabled = false;
		var aMRuntimeItems = Panel._mapSelectionDialogItems(aSelectionDialogItems);

		var aMVisibleRuntimeItems = Panel._getVisibleItems(aMRuntimeItems);
		var aMVisibleBaseLineItems = Panel._getVisibleItems(aMBaseLineItems);

		if (aMVisibleRuntimeItems.length !== aMBaseLineItems.length) {
			bShowResetButtonEnabled = true;
		} else if (aMVisibleBaseLineItems.length && aMVisibleRuntimeItems.length) {
			var bAllVisibleBaselineItemsIncludedInVisibleRuntimeItems = Panel._allItemsIncludedInArray(aMVisibleBaseLineItems, aMVisibleRuntimeItems);
			var bAllVisibleRuntimeItemsIncludedInVisibleBaselineItems = Panel._allItemsIncludedInArray(aMVisibleRuntimeItems, aMVisibleBaseLineItems);

			bShowResetButtonEnabled = !bAllVisibleBaselineItemsIncludedInVisibleRuntimeItems || !bAllVisibleRuntimeItemsIncludedInVisibleBaselineItems;
		}
		return bShowResetButtonEnabled;
	};

	Panel._allItemsIncludedInArray = function(aMItemsToBeIncluded, aMArrayToCheck) {
		var bAllItemsIncluded = true;
		aMItemsToBeIncluded.forEach(function(oItemToBeIncluded) {
			var aMItemsIncluded = Panel._getItemsById(oItemToBeIncluded.id, aMArrayToCheck);
			if (aMItemsIncluded.length === 0) {
				bAllItemsIncluded = false;
			}
		});
		return bAllItemsIncluded;
	};

	Panel._getItemsById = function(sId, aMItems) {
		return aMItems.filter(function(oItem) {
			return oItem.id === sId;
		});
	};

	Panel._getItemById = function(sId, aArray) {
		return Panel._getItemsById(sId, aArray)[0];
	};

	Panel._getVisibleItems = function(aMItems) {
		return aMItems.filter(function(oItem) {
			return oItem.id !== undefined && oItem.visible;
		});
	};

	Panel._mapSelectionDialogItems = function(aSelectionDialogItems) {
		return aSelectionDialogItems.map(function(oSelectionDialogItem) {
			return {
				id: oSelectionDialogItem.getKey(),
				visible: oSelectionDialogItem.getVisible()
			};
		});
	};

	Panel.prototype._isItemBaseline = function(oItem) {
		var aBaselineItems = this._getInternalModel().getProperty("/baselineItems");
		return !!Panel._getItemsById(oItem.id, aBaselineItems).length;
	};

	Panel.prototype._getInternalModel = function() {
		return this.getModel("$sapuimdclinkPanel");
	};

	Panel.prototype._propagateDefaultIcon = function(bShowDefaultIcon) {
		// If at least one item has an icon we have to set a default icon for the items which do not have an icon
		// Once the defaultIcon has been set, it can not be reverted (to false)
		if (!bShowDefaultIcon) {
			return;
		}
		var oModel = this._getInternalModel();
		oModel.getProperty("/runtimeItems").forEach(function(oMItem, iIndex) {
			if (!!oMItem.icon) {
				return;
			}
			// Note: due to this enhancement of default icon we have to use internal JSON model $sapuimdclinkPanel>/runtimeItems
			// in the Panel.control.xml. Without this enhancement we could just use $this instead.
			oModel.setProperty("/runtimeItems/" + iIndex + "/icon", "sap-icon://chain-link");
		});
	};

	function _observeChanges(oChanges) {
		var oModel = this._getInternalModel();
		if (oChanges.object.isA("sap.ui.mdc.link.Panel")) {
			switch (oChanges.name) {
				case "additionalContent":
					var aAdditionalContent = oChanges.child ? [ oChanges.child ] : oChanges.children;
					oModel.setProperty("/countAdditionalContent", aAdditionalContent.length);
					break;
				case "items":
					var aItems = oChanges.child ? [
						oChanges.child
					] : oChanges.children;

					aItems.forEach(function(oPanelItem) {
						var aRuntimeItems = oModel.getProperty("/runtimeItems/");
						switch (oChanges.mutation) {
							case "insert":
								oModel.setProperty("/countItemsWithIcon", oPanelItem.getIcon() ? oModel.getProperty("/countItemsWithIcon") + 1 : oModel.getProperty("/countItemsWithIcon"));
								oModel.setProperty("/countItemsWithoutIcon", oPanelItem.getIcon() ? oModel.getProperty("/countItemsWithoutIcon") : oModel.getProperty("/countItemsWithoutIcon") + 1);
								// Note: the new item(s) has been already added/inserted into the aggregation, so we have to insert the relevant model item into same position.
								aRuntimeItems.splice(this.indexOfItem(oPanelItem), 0, oPanelItem.getJson());
								oModel.setProperty("/runtimeItems", aRuntimeItems);

								this._propagateDefaultIcon(oModel.getProperty("/countItemsWithIcon") > 0 && oModel.getProperty("/countItemsWithoutIcon") > 0);

								// Assumption: only property 'visible' can be changed inside of the 'items' aggregation during the runtime.
								this._oObserver.observe(oPanelItem, {
									properties: [
										"visible"
									]
								});
								break;
							case "remove":
								oModel.setProperty("/countItemsWithIcon", oPanelItem.getIcon() ? oModel.getProperty("/countItemsWithIcon") - 1 : oModel.getProperty("/countItemsWithIcon"));
								oModel.setProperty("/countItemsWithoutIcon", oPanelItem.getIcon() ? oModel.getProperty("/countItemsWithoutIcon") : oModel.getProperty("/countItemsWithoutIcon") - 1);

								aRuntimeItems.splice(this.indexOfItem(oPanelItem), 1);
								oModel.setProperty("/runtimeItems", aRuntimeItems);

								this._propagateDefaultIcon(oModel.getProperty("/countItemsWithIcon") > 0 && oModel.getProperty("/countItemsWithoutIcon") > 0);

								this._oObserver.unobserve(oPanelItem);
								oPanelItem.destroy();
								break;
							default:
								Log.error("Mutation '" + oChanges.mutation + "' is not supported yet.");
						}
					}, this);
					break;
				case "enablePersonalization":
					this.byId("idSectionPersonalizationButton").setVisible(oChanges.current);
					break;
				default:
					Log.error("The property or aggregation '" + oChanges.name + "' has not been registered.");
			}
		} else if (oChanges.object.isA("sap.ui.mdc.link.PanelItem")) {
			switch (oChanges.name) {
				case "visible":
					var oPanelItem = oChanges.object;
					var iIndex = this.indexOfItem(oPanelItem);
					if (oPanelItem.getVisibleChangedByUser()) {
						// Note: the new item(s) has been already added/inserted into the aggregation, so we have to insert the relevant model item into same index.
						oModel.setProperty("/runtimeItems/" + iIndex + "/visible", oPanelItem.getVisible());
					} else {
						oModel.setProperty("/baselineItems/" + iIndex + "/visible", oPanelItem.getVisible());
						oModel.setProperty("/runtimeItems/" + iIndex + "/visible", oPanelItem.getVisible());
					}
					break;
				default:
					Log.error("The '" + oChanges.name + "' of PanelItem is not supported yet.");
			}
		}
		this._updateContentTitle();
	}

	Panel.prototype.getContentTitle = function() {
		var oModel = this._getInternalModel();
		return oModel.getProperty("/contentTitle");
	};

	Panel.prototype._updateContentTitle = function() {
		var oModel = this._getInternalModel();
		var aAdditionalContent = this.getAdditionalContent();
		var oContentTitle = "idSectionPersonalizationButton";

		if (aAdditionalContent.length > 0) {
			oContentTitle = aAdditionalContent[0];
		} else {
			var aItems = this.getItems();
			if (aItems.length > 0) {
				oContentTitle = aItems[0];
			}
		}

		oModel.setProperty("/contentTitle", oContentTitle);
	};

	return Panel;

});
