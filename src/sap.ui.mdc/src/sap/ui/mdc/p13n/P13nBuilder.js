/*!
 * ${copyright}
 */
sap.ui.define([
	"./PropertyHelper",
	"sap/base/i18n/Localization",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/Title",
	"sap/base/util/merge",
	"sap/m/MessageBox",
	"sap/ui/Device",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/core/library"
], function(P13nPropertyHelper, Localization, Button, Bar, Title, merge, MessageBox, Device, Library, Locale, FieldExtensibility, coreLibrary) {
	"use strict";

	const oRB = Library.getResourceBundleFor("sap.ui.mdc");

	//Shortcut to sap.ui.core.TitleLevel
	const TitleLevel = coreLibrary.TitleLevel;

	/**
	 *  Internal Utility class to create personalization UI's
	 *
	 * @author SAP SE
	 * @private
	 * @since 1.81.0
	 * @alias sap.ui.mdc.p13n.P13nBuilder
	 */
	const P13nBuilder = {

		/**
		 *
		 * @param {object} oP13nUI Control displayed in the content area
		 * @param {object} mDialogSettings Settings to overwrite popover default properties, such as: <code>contentHeight</code>
		 * @param {object} [mDialogSettings.reset] Reset settings for the custom header creation
		 * @param {function} [mDialogSettings.reset.onExecute] Callback executed upon triggering a reset
		 * @param {string} [mDialogSettings.reset.warningText] Warning which is displyed prior to executing the reset
		 *
		 * @returns {Promise} promise resolving in the Popover instance
		 */
		createP13nPopover: function(oP13nUI, mDialogSettings) {

			return new Promise(function(resolve, reject){

				sap.ui.require(["sap/m/ResponsivePopover"], function(ResponsivePopover){
					P13nBuilder["_checkSettings"](oP13nUI, mDialogSettings, reject);

					const oPopover = new ResponsivePopover({
						title: mDialogSettings.title,
						horizontalScrolling: mDialogSettings.hasOwnProperty("horizontalScrolling") ? mDialogSettings.horizontalScrolling : false,
						verticalScrolling: mDialogSettings.hasOwnProperty("verticalScrolling") ? mDialogSettings.verticalScrolling : false,
						contentWidth: mDialogSettings.contentWidth ? mDialogSettings.contentWidth : "24rem",
						resizable: mDialogSettings.hasOwnProperty("resizable") ? mDialogSettings.resizable : true,
						contentHeight: mDialogSettings.contentHeight ? mDialogSettings.contentHeight : "35rem",
						placement: mDialogSettings.placement ? mDialogSettings.placement : "Bottom",
						content: oP13nUI,
						afterClose: mDialogSettings.afterClose ? mDialogSettings.afterClose : function(){}
					});

					if (mDialogSettings.reset) {
						const oCustomHeader = P13nBuilder._createResetHeader({
							title: mDialogSettings.title,
							reset: mDialogSettings.reset.onExecute,
							idResetButton: mDialogSettings.reset.idButton,
							warningText: mDialogSettings.reset.warningText
						});
						oPopover.setCustomHeader(oCustomHeader);
					}

					resolve(oPopover);
				},reject);
			});

		},

		/**
		 *
		 * @param {object} oP13nUI Control displayed in the content area
		 * @param {object} mDialogSettings Settings to overwrite dialog default properties, such as: <code>contentHeight</code>
		 * @param {object} [mDialogSettings.reset] Reset settings for the custom header creation
		 * @param {function} [mDialogSettings.reset.onExecute] Callback executed upon triggering a reset
		 * @param {string} [mDialogSettings.reset.warningText] Warning which is displyed prior to executing the reset
		 *
		 * @returns {Promise} Promise resolving in the Dialog instance
		 */
		createP13nDialog: function(oP13nUI, mDialogSettings) {

			return new Promise(function(resolve, reject){

				P13nBuilder["_checkSettings"](oP13nUI, mDialogSettings, reject);

				const sId = mDialogSettings.id;

				sap.ui.require(["sap/m/Dialog", "sap/m/Button"], function(Dialog, Button){
					const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
					const oContainer = new Dialog(sId, {
						title: mDialogSettings.title,
						horizontalScrolling: mDialogSettings.hasOwnProperty("horizontalScrolling") ? mDialogSettings.horizontalScrolling : false,
						verticalScrolling: mDialogSettings.hasOwnProperty("verticalScrolling") ? mDialogSettings.verticalScrolling : true,
						contentWidth: mDialogSettings.contentWidth ? mDialogSettings.contentWidth : "40rem",
						contentHeight: mDialogSettings.contentHeight ? mDialogSettings.contentHeight : "55rem",
						draggable: true,
						resizable: true,
						stretch: Device.system.phone,
						content: oP13nUI,
						afterClose: mDialogSettings.afterClose ? mDialogSettings.afterClose : function(){},
						buttons: [
							new Button(sId ? sId + "-confirmBtn" : undefined, {
								text:  mDialogSettings.confirm && mDialogSettings.confirm.text ?  mDialogSettings.confirm.text : oResourceBundle.getText("p13nDialog.OK"),
								type: "Emphasized",
								press: function() {
									if (mDialogSettings.confirm && mDialogSettings.confirm.handler) {
										mDialogSettings.confirm.handler.apply(oContainer, arguments);
									}
								}

							}), new Button(sId ? sId + "-cancelBtn" : undefined, {
								text: oResourceBundle.getText("p13nDialog.CANCEL"),
								press: function () {
									mDialogSettings.cancel.apply(oContainer, arguments);
								}
							})
						]
					});

					if (mDialogSettings.reset) {
						const oCustomHeader = P13nBuilder._createResetHeader({
							title: mDialogSettings.title,
							idResetButton: mDialogSettings.reset.idButton,
							reset: mDialogSettings.reset.onExecute,
							warningText: mDialogSettings.reset.warningText
						});
						oContainer.setCustomHeader(oCustomHeader);
					}

					const aAdditionalButtons = mDialogSettings.additionalButtons;
					if (aAdditionalButtons instanceof Array) {
						aAdditionalButtons.forEach(function(oButton){
							if (!oButton.isA("sap.m.Button")) {
								reject("Please only provide sap.m.Button instances as 'additionalButtons'");
							}
							oContainer.addButton(oButton);
						});
					}
					resolve(oContainer);
				}, reject);
			});

		},

		/**
		 *
		 * @param {object} mSettings Settings object to create a customHeader including a reset Button
		 * @param {string} mSettings.title Title for the custom reset header
		 * @param {function} mSettings.reset Control specific reset handling
		 * @param {string} [mSettings.warningText] Text which is displayed prior to executing to reset execution
		 *
		 * @returns {sap.m.Bar} The created custom header Bar
		 */
		_createResetHeader: function(mSettings) {

			const oBar = new Bar({
				contentLeft: [
					new Title({
						text: mSettings.title,
						level: TitleLevel.H1
					})
				]
			});

			if (mSettings.reset) {
				const sId = mSettings.idResetButton;
				oBar.addContentRight(new Button( sId, {
					text: Library.getResourceBundleFor("sap.ui.mdc").getText("p13nDialog.RESET"),
					press: function(oEvt) {

						const oDialog =  oEvt.getSource().getParent().getParent();
						const oControl = oDialog.getParent();

						const sResetText = mSettings.warningText ? mSettings.warningText : Library.getResourceBundleFor("sap.ui.mdc").getText("filterbar.ADAPT_RESET_WARNING");
						MessageBox.warning(sResetText, {
							actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
							emphasizedAction: MessageBox.Action.OK,
							onClose: function (sAction) {
								if (sAction === MessageBox.Action.OK) {
									// --> focus "OK" button after 'reset' has been triggered
									oDialog.getButtons()[0].focus();
									mSettings.reset(oControl);
								}
							}
						});
					}
				}));
			}

			return oBar;
		},

		prepareAdaptationData: function(vProperties, fnEnhace, bGroupData) {

			const oPropertyHelper =
				vProperties && vProperties.getProperties instanceof Function ?
				vProperties : new P13nPropertyHelper(vProperties);

			const aItems = [];
			const mItemsGrouped = bGroupData ? {} : null;

			const bEnhance = fnEnhace instanceof Function;

			oPropertyHelper.getProperties().forEach(function(oProperty) {

				const mItem = {};
				mItem.name = oProperty.name;

				if (bEnhance) {
					const bIsValid = fnEnhace(mItem, oProperty);
					if (!bIsValid) {
						return;
					}
				}

				mItem.label = oProperty.label || oProperty.name;
				mItem.tooltip = oProperty.tooltip;

				if (mItemsGrouped) {
					mItem.group = oProperty.group ? oProperty.group : "BASIC";
					mItem.groupLabel = oProperty.groupLabel;
					mItemsGrouped[mItem.group] = mItemsGrouped[mItem.group] ? mItemsGrouped[mItem.group] : [];
					mItemsGrouped[mItem.group].push(mItem);
				}

				aItems.push(mItem);

			});

			const oAdaptationData = {
				items: aItems
			};

			if (mItemsGrouped) {
				oAdaptationData.itemsGrouped = this._buildGroupStructure(mItemsGrouped);
			}

			return oAdaptationData;

		},

		//TODO: generify
		sortP13nData: function (oSorting, aItems) {

			const mP13nTypeSorting = oSorting;

			const sPositionAttribute = mP13nTypeSorting.position;
			const sSelectedAttribute = mP13nTypeSorting.visible;

			const sLocale = new Locale(Localization.getLanguageTag()).toString();

			const oCollator = window.Intl.Collator(sLocale, {});

			// group selected / unselected --> sort alphabetically in each group
			aItems.sort(function (mField1, mField2) {
				if (mField1[sSelectedAttribute] && mField2[sSelectedAttribute]) {
					return (mField1[sPositionAttribute] || 0) - (mField2[sPositionAttribute] || 0);
				} else if (mField1[sSelectedAttribute]) {
					return -1;
				} else if (mField2[sSelectedAttribute]) {
					return 1;
				} else if (!mField1[sSelectedAttribute] && !mField2[sSelectedAttribute]) {
					return oCollator.compare(mField1.label, mField2.label);
				}
			});

		},

		_buildGroupStructure: function(mItemsGrouped) {
			const aGroupedItems = [];
			Object.keys(mItemsGrouped).forEach(function(sGroupKey){
				this.sortP13nData("generic", mItemsGrouped[sGroupKey]);
				aGroupedItems.push({
					group: sGroupKey,
					groupLabel: mItemsGrouped[sGroupKey][0].groupLabel || oRB.getText("p13nDialog.FILTER_DEFAULT_GROUP"),//Grouplabel might not be necessarily be propagated to every item
					groupVisible: true,
					items: mItemsGrouped[sGroupKey]
				});
			}.bind(this));
			return aGroupedItems;

		},

		_isExcludeProperty: function(oProperty, aIgnoreAttributes){

			return aIgnoreAttributes.some(function(oKeyValuePair){
				const sIgnoreKey = oKeyValuePair.ignoreKey;
				const vIgnoreValue = oKeyValuePair.ignoreValue;
				return oProperty[sIgnoreKey] === vIgnoreValue;
			});

		},

		_checkSettings: function(oP13nUI, mDialogSettings, fnOnError) {
			if (!mDialogSettings) {
				fnOnError("Please provide a settings object for p13n creation");
			}

			if (!mDialogSettings.title && !mDialogSettings.customHeader) {
				fnOnError("Please provide a title or customHeader in the settings object for p13n creation");
			}
		},

		arrayToMap: function(aArray) {
			return aArray.reduce(function(mMap, oProp, iIndex){
				mMap[oProp.name] = oProp;
				mMap[oProp.name].position = iIndex;
				return mMap;
			}, {});
		},

		/**
		 *
		 * @param {object} oDialog AdaptFiltersDialog
		 * @param {object} [oParent] An optional parent object to chain if necessary
		 *
		 * @returns {Promise} Promise resolving in the Dialog instance
		 */
		addRTACustomFieldButton: function (oDialog, oParent) {

			let bExtensibilityEnabled = false,
				oDialogParent = oDialog.getParent();

			// cover SmartTable scenario
			if (oParent && oParent.isA('sap.ui.comp.smarttable.SmartTable')) {
				oDialogParent = oParent;
			}

			return sap.ui.getCore().loadLibrary('sap.ui.rta', {
				async: true
			}).then(function() {
				return new Promise(function(resolve) {
					sap.ui.require([
						"sap/ui/rta/Utils"
					], function(rtaUtils) {
						const oHandleExtensibility = Promise.all([
							rtaUtils.isServiceUpToDate(oDialogParent),
							FieldExtensibility.isExtensibilityEnabled(oDialogParent)
						]);

						return oHandleExtensibility.then(function (aResult) {
							bExtensibilityEnabled = !!aResult[1];
						})
							.then(function() {
								let oCustomHeader = oDialog.getCustomHeader();
								const 	sId = oDialogParent && oDialogParent.getId ? oDialogParent.getId() : undefined,
										oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

								if (!oCustomHeader) {
									const oBar = new Bar({
										contentLeft: [
											new Title({
												text: oDialog.getTitle(),
												level: TitleLevel.H1
											})
										]
									});
									oDialog.setCustomHeader(oBar);
									oCustomHeader = oDialog.getCustomHeader();
								}

								if (bExtensibilityEnabled) {
									oCustomHeader.addContentRight(new Button( sId + "-addCustomField", {
										icon: "sap-icon://add",
										enabled: bExtensibilityEnabled,
										tooltip: oResourceBundle.getText("p13nDialog.rtaAddTooltip"),
										press: function (oEvt) {
											const sRtaStyleClassName = rtaUtils.getRtaStyleClassName(),
												oAdaptDialog =  oEvt.getSource().getParent().getParent();
											let oControl = oAdaptDialog.getParent();

											// cover SmartTable scenario
											if (oParent && oParent.isA('sap.ui.comp.smarttable.SmartTable')) {
												oControl = oParent;
											}

											FieldExtensibility.onControlSelected(oControl).then(function (oRetVal) {
												FieldExtensibility.getExtensionData().then(function (oExtensibilityInfo) {
													FieldExtensibility.onTriggerCreateExtensionData(oExtensibilityInfo, sRtaStyleClassName);
													oAdaptDialog.close(); // close as if there is newly created custom field, next time user tries to open it - it checks for service outdated and shows correct information
												});
											});

										}
									}));

									oDialog.setCustomHeader(oCustomHeader);
									resolve(oDialog);
								}

							});

					});
				});
			});
		}

	};

	return P13nBuilder;
});
