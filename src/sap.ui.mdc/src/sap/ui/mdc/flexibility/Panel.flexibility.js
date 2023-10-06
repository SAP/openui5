/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/changeHandler/Base',
	'./ItemBaseFlex'
], function(Base, ItemBaseFlex) {
	"use strict";

	const oLinkHandler = Object.assign({}, ItemBaseFlex);
    oLinkHandler.findItem = function(oModifier, aActions, sName) {
		return Promise.resolve(sap.ui.getCore().byId(sName));
	};

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
			const aNotExistingItems = aDeltaMItems.filter(function(oDeltaMItem) {
				return !sap.ui.getCore().byId(oDeltaMItem.id);
			});
			// Create a 'create' change only once for an item
			const oNotExistingItemIds = {};
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
					const oSelector = oChange.getContent().selector;

					return Promise.resolve()
						.then(function () {
							// Let's break in XML use-case which is caught by flex. This leads that the change will be triggered again via JS.
							oPanel.getModel();
							return mPropertyBag.modifier.getProperty(oPanel, "metadataHelperPath");
						})
						.then(function (sMediaHelperPath) {
							return new Promise(function(resolve, reject) {
								sap.ui.require([
									'sap/ui/mdc/link/PanelItem', sMediaHelperPath
								], function(PanelItem, MetadataHelper) {
									resolve(MetadataHelper);
								}, function (vError) {
									reject(vError);
								});
							});
						})
						.then(function (MetadataHelper) {
							const oModifier = mPropertyBag.modifier;
							if (oModifier.bySelector(oSelector, mPropertyBag.appComponent, mPropertyBag.view)) {
								return undefined;
								// return Base.markAsNotApplicable("applyChange of createItem: the item with selector " + oSelector + " is already existing and therefore can not be created.", true);
							}

							const aMetadataItems = MetadataHelper.retrieveAllMetadata(oPanel);
							let iItemsIndex;

							const fnIndexOfItemId = function(sId, aItems) {
								let iFoundIndex = -1;
								aItems.some(function(oItem, iIndex) {
									if (oItem.getId() === sId) {
										iFoundIndex = iIndex;
										return true;
									}
								});
								return iFoundIndex;
							};
							const sId = oModifier.getControlIdBySelector(oSelector, mPropertyBag.appComponent);

							return Promise.resolve()
								.then(oModifier.getAggregation.bind(oModifier, oPanel, "items"))
								.then(function(aItems) {
									iItemsIndex = -1;
									let oMetadataOfNewItem = null;
									aMetadataItems.some(function(oMetadataItem) {
										const iItemsIndex_ = fnIndexOfItemId(oMetadataItem.id, aItems);
										if (iItemsIndex_ > -1) {
											iItemsIndex = iItemsIndex_;
										}
										if (oMetadataItem.id === sId) {
											oMetadataOfNewItem = oMetadataItem;
											return true;
										}
									});

									if (!oMetadataOfNewItem) {
										return undefined;
										// return Base.markAsNotApplicable("applyChange of createItem: the item with selector " + oSelector + " is not existing in the metadata and therefore can not be created.", true);
									}

									return oModifier.createControl("sap.ui.mdc.link.PanelItem", mPropertyBag.appComponent, mPropertyBag.view, oMetadataOfNewItem.id, {
										text: oMetadataOfNewItem.text,
										description: oMetadataOfNewItem.description,
										href: oMetadataOfNewItem.href,
										target: oMetadataOfNewItem.target,
										icon: oMetadataOfNewItem.icon,
										visible: true
									});
								})
								.then(function(oItem){
									return oModifier.insertAggregation(oPanel, "items", oItem, iItemsIndex + 1);
								});
						});
				},
				revertChange: function(oChange, oPanel, mPropertyBag) {
					const oModifier = mPropertyBag.modifier;
					if (oChange.getContent() && oChange.getContent().selector) {
						const sId = oChange.getContent().selector.id;
						const oItem = oModifier.bySelector(sId, mPropertyBag.appComponent, mPropertyBag.view);
						if (!oItem) {
							return Base.markAsNotApplicable("revertChange of createItem: the item with id " + sId + " is not existing and therefore can not be removed.", true);
						}
						return Promise.resolve()
							.then(oModifier.removeAggregation.bind(oModifier, oPanel, "items", oItem));
					}
				},
				completeChangeContent: function(oChange, mSpecificChangeInfo, mPropertyBag) {
					if (mSpecificChangeInfo.content) {
						const oSelector = mPropertyBag.modifier.getSelector(mSpecificChangeInfo.content.selector, mPropertyBag.appComponent);
						oChange.setContent({
							selector: oSelector
						});
					}
				}
			}
		}
	};
}, /* bExport= */true);
