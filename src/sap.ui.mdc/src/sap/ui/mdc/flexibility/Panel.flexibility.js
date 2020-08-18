/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/changeHandler/Base'
], function(Base) {
	"use strict";

	/**
	 * Change handlers for adding and remove of a link in sap.ui.mdc.link.Panel.
	 *
	 * @constructor
	 * @private
	 * @since 1.62.0
	 * @alias sap.ui.mdc.flexibility.Panel
	 */

	return {
		createChanges: function(oPanel, aDeltaMItems) {
			// Create a 'create' change only for items which does not exist
			var aNotExistingItems = aDeltaMItems.filter(function(oDeltaMItem) {
				return !sap.ui.getCore().byId(oDeltaMItem.id);
			});
			// Create a 'create' change only once for an item
			var oNotExistingItemIds = {};
			return aNotExistingItems.reduce(function(aResult, oDeltaMItem) {
				if (!oNotExistingItemIds[oDeltaMItem.id]) {
					oNotExistingItemIds[oDeltaMItem.id] = true;
					aResult.push(oDeltaMItem);
				}
				return aResult;
			}, []).map(function(oDeltaMItem) {
				return {
					selectorElement: oPanel,
					changeSpecificData: {
						changeType: "createItem",
						content: {
							selector: oDeltaMItem.id
						}
					}
				};
			});
		},
		createItem: {
			layers: {
				USER: true
			},
			changeHandler: {
				applyChange: function(oChange, oPanel, mPropertyBag) {
					var oSelector = oChange.getContent().selector;

					return new Promise(function(resolve) {

						// Let's break in XML use-case which is caught by flex. This leads that the change will be triggered again via JS.
						oPanel.getModel();

						sap.ui.require([
							'sap/ui/mdc/link/PanelItem', mPropertyBag.modifier.getProperty(oPanel, "metadataHelperPath")
						], function(PanelItem, MetadataHelper) {
							if (mPropertyBag.modifier.bySelector(oSelector, mPropertyBag.appComponent, mPropertyBag.view)) {
								return resolve();
								// return Base.markAsNotApplicable("applyChange of createItem: the item with selector " + oSelector + " is already existing and therefore can not be created.", true);
							}

							var aMetadataItems = MetadataHelper.retrieveAllMetadata(oPanel);

							var fnIndexOfItemId = function(sId, aItems) {
								var iFoundIndex = -1;
								aItems.some(function(oItem, iIndex) {
									if (oItem.getId() === sId) {
										iFoundIndex = iIndex;
										return true;
									}
								});
								return iFoundIndex;
							};
							var sId = mPropertyBag.modifier.getControlIdBySelector(oSelector, mPropertyBag.appComponent);
							var aItems = mPropertyBag.modifier.getAggregation(oPanel, "items");
							var iItemsIndex = -1;
							var oMetadataOfNewItem = null;
							aMetadataItems.some(function(oMetadataItem) {
								var iItemsIndex_ = fnIndexOfItemId(oMetadataItem.id, aItems);
								if (iItemsIndex_ > -1) {
									iItemsIndex = iItemsIndex_;
								}
								if (oMetadataItem.id === sId) {
									oMetadataOfNewItem = oMetadataItem;
									return true;
								}
							});

							if (!oMetadataOfNewItem) {
								return resolve();
								// return Base.markAsNotApplicable("applyChange of createItem: the item with selector " + oSelector + " is not existing in the metadata and therefore can not be created.", true);
							}

							var oItem = mPropertyBag.modifier.createControl("sap.ui.mdc.link.PanelItem", mPropertyBag.appComponent, mPropertyBag.view, oMetadataOfNewItem.id, {
								text: oMetadataOfNewItem.text,
								description: oMetadataOfNewItem.description,
								href: oMetadataOfNewItem.href,
								target: oMetadataOfNewItem.target,
								icon: oMetadataOfNewItem.icon,
								visible: oMetadataOfNewItem.visible
							});
							mPropertyBag.modifier.insertAggregation(oPanel, "items", oItem, iItemsIndex + 1);
							return resolve();
						});
					});
				},
				revertChange: function(oChange, oPanel, mPropertyBag) {
					if (oChange.getContent() && oChange.getContent().selector) {
						var sId = oChange.getContent().selector.id;
						var oItem = mPropertyBag.modifier.bySelector(sId, mPropertyBag.appComponent, mPropertyBag.view);
						if (!oItem) {
							return Base.markAsNotApplicable("revertChange of createItem: the item with id " + sId + " is not existing and therefore can not be removed.", true);
						}
						mPropertyBag.modifier.removeAggregation(oPanel, "items", oItem);
					}
				},
				completeChangeContent: function(oChange, mSpecificChangeInfo, mPropertyBag) {
					if (mSpecificChangeInfo.content) {
						var oSelector = mPropertyBag.modifier.getSelector(mSpecificChangeInfo.content.selector, mPropertyBag.appComponent);
						var mChangeData = oChange.getDefinition();
						mChangeData.content = {
							selector: oSelector
						};
					}
				}
			}
		}
	};
}, /* bExport= */true);
