/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"./PanelRenderer",
	"sap/ui/layout/VerticalLayout",
	"sap/base/Log",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/ImageContent",
	"sap/m/Link",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/FlexItemData",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/mdc/p13n/subcontroller/LinkPanelController",
	"sap/m/p13n/Engine",
	"sap/ui/mdc/mixin/AdaptationMixin",
	"sap/ui/mdc/link/PanelItem",
	"sap/ui/core/CustomData",
	"sap/ushell/library"
], function(Control, PanelRenderer, VerticalLayout, Log, HorizontalLayout, HBox, VBox, ImageContent, Link, Label, Text, Button, FlexItemData, JSONModel, BindingMode, ManagedObjectObserver, LinkPanelController, Engine, AdaptationMixin, PanelItem, CustomData, ushellLibrary) {
	"use strict";

	/**
	 * Constructor for a new Panel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The Panel control is used to show <code>items</code> and <code>additionalContent</code>. After providing of the <code>items</code> it is
	 * supposed that the properties of the item structure is not changed.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.54.0
	 * @alias sap.ui.mdc.link.Panel
	 */
	const Panel = Control.extend("sap.ui.mdc.link.Panel", /** @lends sap.ui.mdc.link.Panel.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
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
					multiple: true
				},
				/**
				 * Internal VerticalLayout which holds the content of the Panel
				 */
				_content: {
					type: "sap.ui.layout.VerticalLayout",
					visibility: "hidden",
					multiple: false
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
		},
		renderer: PanelRenderer
	});

	Panel.prototype.init = function() {
		Control.prototype.init.call(this);

		Engine.getInstance().register(this, {
			controller: {
				LinkItems: new LinkPanelController({control: this})
			}
		});

		AdaptationMixin.call(Panel.prototype);

		Engine.getInstance().defaultProviderRegistry.attach(this, "Global");

		sap.ui.require([
			this.getMetadataHelperPath() || "sap/ui/mdc/Link"
		], function(MetadataHelper) {
			this._oMetadataHelper = MetadataHelper;
		}.bind(this));

		const oModel = new JSONModel({
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

	const oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	Panel.prototype.applySettings = function() {
		this._createContent();
		Control.prototype.applySettings.apply(this, arguments);
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

	const iAdditionalContentAreaIndex = 0,
		iSeparatorIndex = 1,
		iLinkAreaIndex = 2,
		iFooterAreaIndex = 3;

	Panel.prototype._createContent = function() {
		const oVerticalLayoutContent = [];
		oVerticalLayoutContent[iAdditionalContentAreaIndex] = this._createAdditionalContentArea();
		oVerticalLayoutContent[iSeparatorIndex] = this._createSeparator();
		oVerticalLayoutContent[iLinkAreaIndex] = this._createLinkArea();
		oVerticalLayoutContent[iFooterAreaIndex] = this._createFooterArea();

		const oVerticalLayout = new VerticalLayout({
			width: "100%",
			content: oVerticalLayoutContent
		});
		this.setAggregation("_content", oVerticalLayout);
	};

	Panel.prototype._createAdditionalContentArea = function() {
		const oAdditionalContentArea = new VBox({
			fitContainer: false,
			items: this.getAdditionalContent()
		});

		return oAdditionalContentArea;
	};

	Panel.prototype._createSeparator = function() {
		const oSeparator = new VBox({
			fitContainer: false,
			visible: {
				parts: [
					{ path: "$sapuimdclinkPanel>/countAdditionalContent" },
					{ path: "$sapuimdcLink>/metadata" }
				],
				formatter: function(iAdditionalContentCount, aMetadata) {
					return iAdditionalContentCount > 0 && aMetadata.length > 0;
				}
			}
		});
		oSeparator.addStyleClass("mdcbaseinfoPanelSeparator");
		oSeparator.setModel(this._getInternalModel(), "$sapuimdclinkPanel");
		oSeparator.setModel(this.getModel("$sapuimdcLink"), "$sapuimdcLink");

		return oSeparator;
	};

	Panel.prototype._createLinkArea = function() {
		const oLinkArea = new VBox({
			fitContainer: false,
			items: {
				path: "$sapuimdclinkPanel>/runtimeItems",
				templateShareable: false,
				factory: this._fnLinkItemFactory.bind(this)
			}
		});
		oLinkArea.addStyleClass("mdcbaseinfoPanelSectionLinks");
		oLinkArea.setModel(this._getInternalModel(), "$sapuimdclinkPanel");

		return oLinkArea;
	};

	Panel.prototype._fnLinkItemFactory = function(sId, oBindingContext) {
		const oImageContent = new ImageContent({
			src: "{$sapuimdclinkPanel>icon}",
			visible: {
				path: "$sapuimdclinkPanel>icon",
				formatter: function(sIcon) {
					return !!sIcon;
				}
			}
		});
		const oLink = new Link({
			text: "{$sapuimdclinkPanel>text}",
			href: "{$sapuimdclinkPanel>href}",
			target: "{$sapuimdclinkPanel>target}",
			visible: {
				path: "$sapuimdclinkPanel>href",
				formatter: function(sHref) {
					return !!sHref;
				}
			},
			press: this.onPressLink.bind(this),
			wrapping: true,
			customData: new CustomData({
				key: "internalHref",
				value: "{$sapuimdclinkPanel>internalHref}"
			})
		});
		const oLabel = new Label({
			text: "{$sapuimdclinkPanel>text}",
			visible: {
				path: "$sapuimdclinkPanel>href",
				formatter: function(sHref) {
					return !sHref;
				}
			},
			wrapping: true
		});
		const oText = new Text({
			text: "{$sapuimdclinkPanel>description}",
			visible: {
				path: "$sapuimdclinkPanel>description",
				formatter: function(sDescription) {
					return !!sDescription;
				}
			},
			wrapping: true
		});
		const oVBox = new VBox({
			items: [ oLink, oLabel, oText ]
		});
		const oHBox = new HBox({
			layoutData: new FlexItemData({
				styleClass: oBindingContext.getProperty("description") ? "mdcbaseinfoPanelItemsGroup" : "mdcbaseinfoPanelItemsWithoutGroup"
			}),
			items: [ oImageContent, oVBox ]
		});
		const oPanelListItem = new HorizontalLayout({
			visible: "{$sapuimdclinkPanel>visible}",
			content: [ oHBox ]
		});
		oPanelListItem.addStyleClass("mdcbaseinfoPanelListItem");

		return oPanelListItem;
	};

	Panel.prototype._createFooterArea = function() {
		const oResetButton = new Button(this.getId() + "--idSectionPersonalizationButton", {
			type: "Transparent",
			text: oRB.getText("info.POPOVER_DEFINE_LINKS"),
			press: this.onPressLinkPersonalization.bind(this)
		});
		const oFooterArea = new HBox({
			visible: {
				path: "$sapuimdcLink>/metadata",
				formatter: function(aMetadata) {
					return aMetadata.length > 0;
				}
			},
			justifyContent: "End",
			items: [ oResetButton ]
		});
		oFooterArea.addStyleClass("mdcbaseinfoPanelPersonalizationButton");

		return oFooterArea;
	};

	Panel.prototype.onPressLink = function(oEvent) {
		const oLink = oEvent.getSource();
		const bCtrlKeyPressed = oEvent.getParameters().ctrlKey || oEvent.getParameters().metaKey;
		if (this.getBeforeNavigationCallback() && oLink && oLink.getTarget() !== "_blank" && !bCtrlKeyPressed) {
			// Fall back to using href property when there is no internalHref
			const bUseInternalHref = oLink && oLink.getCustomData() && oLink.getCustomData()[0] && oLink.getCustomData()[0].getValue();
			const sHref = bUseInternalHref ? oLink.getCustomData()[0].getValue() : oLink.getHref();
			oEvent.preventDefault();
			this.getBeforeNavigationCallback()(oEvent).then(function(bNavigate) {
				if (bNavigate) {
					Panel.navigate(sHref);
				}
			});
		}
	};

	Panel.oNavigationPromise = undefined;

	Panel.navigate = function(sHref) {
		if (sHref.indexOf("#") === 0 && ushellLibrary && sap.ushell.Container && sap.ushell.Container.getServiceAsync) {
			// if we are inside a FLP -> navigate with CrossApplicationNavigation
			if (!Panel.oNavigationPromise) {
				Panel.oNavigationPromise = sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossApplicationNavigation) {
					oCrossApplicationNavigation.toExternal({
						target: {
							// navigate to href without #
							shellHash: sHref.substring(1)
						}
					});
					Panel.oNavigationPromise = undefined;
				});
			}
		} else {
			// if we are not inside a FLP -> navigate "normally"
			window.location.href = sHref;
		}
	};

	Panel.prototype.onPressLinkPersonalization = function() {
		this._openPersonalizationDialog();
	};

	Panel.prototype._openPersonalizationDialog = function() {
		return new Promise(function(resolve, reject) {
			sap.ui.require([this.getMetadataHelperPath() || "sap/ui/mdc/Link"], function(MetadataHelper) {
				const oModel = this._getInternalModel();
				const aMBaselineItems = MetadataHelper.retrieveBaseline(this);
				const aMBaselineItemsTotal = aMBaselineItems;
				const fnUpdateResetButton = function(oSelectionPanel) {
					let aSelectedItems = oSelectionPanel._oListControl.getItems().filter(function(oItem) {
						return oItem.getSelected();
					});
					aSelectedItems = aSelectedItems.map(function(oSelectedItem) {
						const oItem = oSelectionPanel._getP13nModel().getProperty(oSelectedItem.getBindingContext(oSelectionPanel.P13N_MODEL).sPath);
						return {
							id: oItem.name,
							description: oItem.description,
							href: oItem.href,
							internalHref: oItem.internalHref,
							target: oItem.target,
							text: oItem.text,
							visible: oItem.visible
						};
					});
					const bShowResetEnabled = Panel._showResetButtonEnabled(aMBaselineItemsTotal, aSelectedItems);
					this._getInternalModel().setProperty("/showResetEnabled", bShowResetEnabled);
				};

				const oParent = this.getParent();
				// In case of mobile oParent isA sap.m.Dialog
				if (oParent.isA("sap.m.Popover")) {
					oParent.setModal(true);
				}
				Engine.getInstance().uimanager.show(this, "LinkItems", {
					contentWidth: "28rem",
					contentHeight: "35rem",
					close: function() {
						if (oParent.isA("sap.m.Popover")) {
							oParent.setModal(false);
						}
					}
				}).then(function(oDialog) {
					const oResetButton = oDialog.getCustomHeader().getContentRight()[0];
					const oSelectionPanel = oDialog.getContent()[0];
					oResetButton.setModel(oModel, "$sapuimdclinkPanel");
					oResetButton.bindProperty("enabled", {
						path: '$sapuimdclinkPanel>/showResetEnabled'
					});
					fnUpdateResetButton.call(this, oSelectionPanel);
					oSelectionPanel.attachChange(function(oEvent) {
						fnUpdateResetButton.call(this, oSelectionPanel);
						oSelectionPanel.attachChange(function(oEvent) {
							fnUpdateResetButton.call(this, oSelectionPanel);
						}.bind(this));
						oDialog.attachAfterClose(function() {
							if (oParent.isA("sap.m.Popover")) {
								oParent.setModal(false);
							}
						});
					}.bind(this));
					resolve(oDialog);
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	Panel._showResetButtonEnabled = function(aMBaseLineItems, aSelectedItems) {
		let bShowResetButtonEnabled = false;

		const aMVisibleRuntimeItems = Panel._getVisibleItems(aSelectedItems);
		const aMVisibleBaseLineItems = Panel._getVisibleItems(aMBaseLineItems);

		if (aSelectedItems.length !== aMBaseLineItems.length) {
			bShowResetButtonEnabled = true;
		} else if (aMVisibleBaseLineItems.length && aMVisibleRuntimeItems.length) {
			const bAllVisibleBaselineItemsIncludedInVisibleRuntimeItems = Panel._allItemsIncludedInArray(aMVisibleBaseLineItems, aMVisibleRuntimeItems);
			const bAllVisibleRuntimeItemsIncludedInVisibleBaselineItems = Panel._allItemsIncludedInArray(aMVisibleRuntimeItems, aMVisibleBaseLineItems);

			bShowResetButtonEnabled = !bAllVisibleBaselineItemsIncludedInVisibleRuntimeItems || !bAllVisibleRuntimeItemsIncludedInVisibleBaselineItems;
		}
		return bShowResetButtonEnabled;
	};

	Panel._allItemsIncludedInArray = function(aMItemsToBeIncluded, aMArrayToCheck) {
		let bAllItemsIncluded = true;
		aMItemsToBeIncluded.forEach(function(oItemToBeIncluded) {
			const aMItemsIncluded = Panel._getItemsById(oItemToBeIncluded.id, aMArrayToCheck);
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

	Panel.prototype._getInternalModel = function() {
		return this.getModel("$sapuimdclinkPanel");
	};

	Panel.prototype._propagateDefaultIcon = function(bShowDefaultIcon) {
		// If at least one item has an icon we have to set a default icon for the items which do not have an icon
		// Once the defaultIcon has been set, it can not be reverted (to false)
		if (!bShowDefaultIcon) {
			return;
		}
		const oModel = this._getInternalModel();
		oModel.getProperty("/runtimeItems").forEach(function(oMItem, iIndex) {
			if (oMItem.icon) {
				return;
			}
			// Note: due to this enhancement of default icon we have to use internal JSON model $sapuimdclinkPanel>/runtimeItems
			// in the Panel.control.xml. Without this enhancement we could just use $this instead.
			oModel.setProperty("/runtimeItems/" + iIndex + "/icon", "sap-icon://chain-link");
		});
	};

	let aAdditionalContent, aItems, oRuntimeItem, oPanelItem, iIndex;

	function _observeChanges(oChanges) {
		const oModel = this._getInternalModel();
		if (oChanges.object.isA("sap.ui.mdc.link.Panel")) {
			switch (oChanges.name) {
				case "additionalContent":
					aAdditionalContent = oChanges.child ? [ oChanges.child ] : oChanges.children;
					aAdditionalContent.forEach(function(oAdditionalContent) {
						switch (oChanges.mutation) {
							case "insert":
								// "forward" additional content to the additionalContentArea
								this._getAdditionalContentArea().addItem(oAdditionalContent);
								break;
							case "remove":
								// Don't remove additional content as this will also be called when we forward it to the additionalContentArea
								break;
							default:
								Log.error("Mutation '" + oChanges.mutation + "' is not supported yet.");
						}
					}.bind(this));
					oModel.setProperty("/countAdditionalContent", aAdditionalContent.length);
					break;
				case "items":
					aItems = oChanges.child ? [
						oChanges.child
					] : oChanges.children;

					aItems.forEach(function(oPanelItem) {
						const aRuntimeItems = oModel.getProperty("/runtimeItems/");
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

								oRuntimeItem = aRuntimeItems.find(function(oItem) {
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
					this._getPersonalizationButton().setVisible(oChanges.current);
					break;
				default:
					Log.error("The property or aggregation '" + oChanges.name + "' has not been registered.");
			}
		} else if (oChanges.object.isA("sap.ui.mdc.link.PanelItem")) {
			switch (oChanges.name) {
				case "visible":
					oPanelItem = oChanges.object;
					iIndex = this.indexOfItem(oPanelItem);
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
		const oModel = this._getInternalModel();
		const oContentTitle = oModel.getProperty("/contentTitle");
		if (oContentTitle) {
			return oContentTitle;
		} else {
			this._updateContentTitle();
			return this.getContentTitle();
		}
	};

	Panel.prototype.getCurrentState = function() {
		const aItems = [];
		let sId;

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

			const aAllLinkItems = this._oMetadataHelper.retrieveAllMetadata(this);

			return Promise.resolve({
				getProperties: function() {

					const aItems = [];
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
							internalHref: oItem.internalHref,
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
		const oModel = this._getInternalModel();
		const aAdditionalContent = this._getAdditionalContentArea().getItems();
		let oContentTitle = this._getPersonalizationButton();

		if (aAdditionalContent.length > 0) {
			oContentTitle = aAdditionalContent[0];
		} else {
			const aLinkControls = this._getLinkControls();
			if (aLinkControls.length > 0) {
				oContentTitle = aLinkControls[0];
			}
		}

		oModel.setProperty("/contentTitle", oContentTitle);
	};

	Panel.prototype._getAdditionalContentArea = function() {
		return this.getAggregation("_content").getContent()[iAdditionalContentAreaIndex];
	};

	Panel.prototype._getSeparator = function() {
		return this.getAggregation("_content").getContent()[iSeparatorIndex];
	};

	Panel.prototype._getLinkArea = function() {
		return this.getAggregation("_content").getContent()[iLinkAreaIndex];
	};

	Panel.prototype._getLinkControls = function() {
		return this._getLinkArea().getItems().map((HorizontalLayout /* see _fnLinkItemFactory */) => {
			return HorizontalLayout.getContent()[0] // HBox
				.getItems()[1] // VBox
				.getItems()[0]; // Link
		});
	};

	Panel.prototype._getFooterArea = function() {
		return this.getAggregation("_content").getContent()[iFooterAreaIndex];
	};

	Panel.prototype._getPersonalizationButton = function() {
		return this._getFooterArea().getItems()[0];
	};

	return Panel;

});
