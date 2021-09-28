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
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/BindingMode',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/mdc/flexibility/PanelItem.flexibility',
	'sap/ui/mdc/flexibility/Panel.flexibility',
	"sap/ui/core/syncStyleClass",
	"sap/ui/mdc/p13n/subcontroller/LinkPanelController",
	"sap/ui/mdc/p13n/Engine",
	"sap/ui/mdc/mixin/AdaptationMixin"
], function(XMLComposite, mdcLibrary, HBox, VBox, Text, Image, Link, CustomData, Log, SelectDialog, StandardListItem, JSONModel, BindingMode, ManagedObjectObserver, PanelItemFlexibility, PanelFlexibility, syncStyleClass, LinkPanelController, Engine, AdaptationMixin) {
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

		Engine.getInstance().registerAdaptation(this, {
			controller: {
				LinkItems: LinkPanelController
			}
		});

		AdaptationMixin.call(Panel.prototype);

		Engine.getInstance().defaultProviderRegistry.attach(this, "Global");

		sap.ui.require([
			this.getMetadataHelperPath() || "sap/ui/mdc/Link"
		], function(MetadataHelper) {
			this._oMetadataHelper = MetadataHelper;
		}.bind(this));

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
		if (this._oMetadataHelper) {
			this._oMetadataHelper = null;
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
		var oPopover = this.getParent();
		oPopover.setModal(true);
		Engine.getInstance().uimanager.show(this, "LinkItems").then(function(oDialog) {
			oDialog.attachAfterClose(function(){
				oPopover.setModal(false);
			});
		});
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
			if (oMItem.icon) {
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

								var oRuntimeItem = aRuntimeItems.find(function(oItem) {
									return oItem.id === oPanelItem.getId();
								});
								aRuntimeItems.splice(aRuntimeItems.indexOf(oRuntimeItem), 1);
								oModel.setProperty("/runtimeItems", aRuntimeItems);

								this._propagateDefaultIcon(oModel.getProperty("/countItemsWithIcon") > 0 && oModel.getProperty("/countItemsWithoutIcon") > 0);

								this._oObserver.unobserve(oPanelItem);
								oPanelItem.destroy();
								this.invalidate(); // TODO: Check why this is needed to update the items on the panel
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

	Panel.prototype.getCurrentState = function() {
		var aItems = [], sId;

		this.getItems().forEach(function(oItem, iIndex) {
			sId = oItem && oItem.getId();
			if (oItem.getVisible()) {
				aItems.push({
					name: sId
				});
			}
		});

		return {
			items: aItems
		};
	};

	Panel.prototype.initPropertyHelper = function() {

			var aAllLinkItems = this._oMetadataHelper.retrieveAllMetadata(this);

			return Promise.resolve({
				getProperties: function() {

					var aItems = [];
					aAllLinkItems.forEach(function(oItem){
						aItems.push({
							name: oItem.id,
							getName: function() {
								return oItem.id;
							},
							getLabel: function() {
								return oItem.text;
							},
							text: oItem.text,
							href: oItem.href,
							description: oItem.description,
							target: oItem.target,
							visible: oItem.visible
						});
					});

					return aItems;
				}
			});
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
