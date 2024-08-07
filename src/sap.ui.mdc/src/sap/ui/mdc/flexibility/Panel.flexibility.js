/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	'sap/ui/fl/changeHandler/Base',
	'./Util'
], (Element, Base, Util) => {
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
		createChanges: function (oPanel, aDeltaMItems) {
			// Create a 'create' change only for items which does not exist
			const aNotExistingItems = aDeltaMItems.filter((oDeltaMItem) => {
				return !Element.getElementById(oDeltaMItem.id);
			});
			// Create a 'create' change only once for an item
			const oNotExistingItemIds = {};
			return aNotExistingItems.reduce((aResult, oDeltaMItem) => {
				if (!oNotExistingItemIds[oDeltaMItem.id]) {
					oNotExistingItemIds[oDeltaMItem.id] = true;
					aResult.push(oDeltaMItem);
				}
				return aResult;
			}, []).map((oDeltaMItem) => {
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
		createItem: Util.createChangeHandler({
			apply: (oChange, oPanel, mPropertyBag) => {
				const oSelector = oChange.getContent().selector;

				return Promise.resolve()
					.then(() => {
						// Let's break in XML use-case which is caught by flex. This leads that the change will be triggered again via JS.
						oPanel.getModel();
						return mPropertyBag.modifier.getProperty(oPanel, "metadataHelperPath");
					})
					.then((sMediaHelperPath) => {
						return new Promise((resolve, reject) => {
							sap.ui.require([
								'sap/ui/mdc/link/PanelItem', sMediaHelperPath
							], (PanelItem, MetadataHelper) => {
								resolve(MetadataHelper);
							}, (vError) => {
								reject(vError);
							});
						});
					})
					.then((MetadataHelper) => {
						const oModifier = mPropertyBag.modifier;
						if (oModifier.bySelector(oSelector, mPropertyBag.appComponent, mPropertyBag.view)) {
							return undefined;
							// return Base.markAsNotApplicable("applyChange of createItem: the item with selector " + oSelector + " is already existing and therefore can not be created.", true);
						}

						const aMetadataItems = MetadataHelper.retrieveAllMetadata(oPanel);
						let iItemsIndex;

						const fnIndexOfItemId = function (sId, aItems) {
							let iFoundIndex = -1;
							aItems.some((oItem, iIndex) => {
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
							.then((aItems) => {
								iItemsIndex = -1;
								let oMetadataOfNewItem = null;
								aMetadataItems.some((oMetadataItem) => {
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
									internalHref: oMetadataOfNewItem.internalHref,
									target: oMetadataOfNewItem.target,
									icon: oMetadataOfNewItem.icon,
									visible: false
								});
							})
							.then((oItem) => {
								return oModifier.insertAggregation(oPanel, "items", oItem, iItemsIndex + 1);
							});
					});
			},
			revert: (oChange, oPanel, mPropertyBag) => {
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
				return undefined;
			},
			complete: (oChange, mSpecificChangeInfo, mPropertyBag) => {
				if (mSpecificChangeInfo.content) {
					const oSelector = mPropertyBag.modifier.getSelector(mSpecificChangeInfo.content.selector, mPropertyBag.appComponent);
					oChange.setContent({
						selector: oSelector
					});
				}
			}
		})
	};
});