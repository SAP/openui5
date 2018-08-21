/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/Metadata",
	"sap/ui/core/CustomData",
	"sap/ui/base/ManagedObjectObserver",
	"./AnchorBar",
	"sap/m/Button",
	"sap/m/MenuButton",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/core/IconPool"
], function (jQuery, Metadata, CustomData, ManagedObjectObserver, AnchorBar, Button, MenuButton, Menu, MenuItem, IconPool) {
	"use strict";

	var ABHelper = Metadata.createClass("sap.uxap._helpers.AB", {
		/**
		 * @private
		 * @param {sap.uxap.ObjectPageLayout} oObjectPageLayout Object Page layout instance
		 */
		constructor: function (oObjectPageLayout) {
			this._oObjectPageLayout = oObjectPageLayout;
			this._iScrollDuration = oObjectPageLayout._iScrollToSectionDuration;
			this._iFocusMoveDelay = this._iScrollDuration - 100;
			this._oObserver = new ManagedObjectObserver(this._proxyStateChanges.bind(this));
			this._aMenusWithAttachPressHandler = [];
		}
	});

	ABHelper.prototype.getObjectPageLayout = function () {
		return this._oObjectPageLayout;
	};

	ABHelper.prototype._proxyStateChanges = function (oChanges) {
		var oObject = oChanges.object,
			oObjectClone = this._findExistingClone(oObject),
			sPropertyName = oChanges.name,
			vCurrentValue = oChanges.current,
			sSetter = "set" + fnCapitalize(sPropertyName);

			if (oObjectClone) {
				oObjectClone[sSetter].call(oObjectClone, vCurrentValue);
			}
	};

	ABHelper.prototype._findExistingClone = function (oObject) {
		var oClone,
			sCloneIdPrefix = oObject.getId() + "-__clone",
			oAnchorBar = this._getAnchorBar(),
			aAnchorBarButtons = oAnchorBar.getContent();

			aAnchorBarButtons.some(function(oButton) {
				if (oButton.getId().indexOf(sCloneIdPrefix) === 0) {
					oClone = oButton;
					return true;
				}
			});

			return oClone;
	};

	/**
	 * Lazy loads the hidden Aggregation "_anchorBar"
	 * @returns {sap.uxap.AnchorBar} AnchorBar
	 * @private
	 */
	ABHelper.prototype._getAnchorBar = function () {
		var oObjectPageLayout = this.getObjectPageLayout(),
			oAnchorBar = oObjectPageLayout.getAggregation("_anchorBar");

		if (!oAnchorBar) {

			oAnchorBar = new AnchorBar({
				id: oObjectPageLayout.getId() + "-anchBar",
				showPopover: oObjectPageLayout.getShowAnchorBarPopover(),
				backgroundDesign: oObjectPageLayout.getBackgroundDesignAnchorBar()
			});

			this.getObjectPageLayout().setAggregation("_anchorBar", oAnchorBar, true);
		}

		return oAnchorBar;
	};

	/**
	 * build the anchorBar and all the anchorBar buttons
	 * @private
	 */
	ABHelper.prototype._buildAnchorBar = function () {
		var aSections = this.getObjectPageLayout().getSections() || [],
			oAnchorBar = this._getAnchorBar(),
			fnPressHandler = jQuery.proxy(oAnchorBar._handleDirectScroll, oAnchorBar),
			sButtonTitle,
			sButtonIcon,
			oMenuItem,
			oCustomButton;

		//tablet & desktop mechanism
		if (oAnchorBar && this.getObjectPageLayout().getShowAnchorBar()) {

			oAnchorBar._resetControl();
			this._oObserver.disconnect(); // unobserve all previousy observed objects

			//first level
			aSections.forEach(function (oSection) {

				if (!oSection.getVisible() || !oSection._getInternalVisible()) {
					return;
				}

				var oButtonClone,
					aSubSections = oSection.getSubSections() || [];

				oButtonClone = this._buildAnchorBarButton(oSection, true);

				if (oButtonClone) {
					oAnchorBar.addContent(oButtonClone);

					if (oButtonClone instanceof MenuButton) {
						var oMenu = new Menu({});

						// the focus goes to the internal SplitButton, so we need to enhance its accessibility properties also
						oButtonClone.enhanceAccessibilityState = function (oElement, mAriaProps) {
							var oContent = oAnchorBar.getContent(),
								iIndex = oContent.indexOf(oElement.getParent());

							if (iIndex !== -1) {
								mAriaProps.role = "menuitemradio";
								mAriaProps.type = "button";
								mAriaProps.setsize = oContent.length;
								mAriaProps.posinset = iIndex + 1;
							}
						};

						oMenu._setCustomEnhanceAccStateFunction(function (oElement, mAriaProps) {
							mAriaProps.controls = oElement.data("sectionId");
						});

						oButtonClone.setMenu(oMenu);
					}

					//second Level
					aSubSections.forEach(function (oSubSection) {

						if (!oSubSection.getVisible() || !oSubSection._getInternalVisible()) {
							return;
						}

						var oSecondLevelButtonClone = this._buildAnchorBarButton(oSubSection, false);

						if (oSecondLevelButtonClone) {
							oAnchorBar.addContent(oSecondLevelButtonClone);
						}

						if (oButtonClone instanceof MenuButton) {
							oCustomButton = oSubSection.getCustomAnchorBarButton();

							if (oCustomButton) {
								sButtonTitle = oCustomButton.getText();
								sButtonIcon = oCustomButton.getIcon();
							} else {
								sButtonTitle = oSubSection._getInternalTitle() || oSubSection.getTitle();
								sButtonIcon = '';
							}

							oMenuItem = new MenuItem({"text": sButtonTitle , "icon": sButtonIcon});

							oMenuItem.addCustomData(new CustomData({
								key: "sectionId",
								value: oSubSection.getId()
							}));

							oMenuItem.attachPress(fnPressHandler);

							oButtonClone.getMenu().addItem(oMenuItem);
						}

					}, this);
				}

			}, this);
		}
	};


	/**
	 * Moves focus on the corresponding subsection when MenuItem is selected
	 * @param {sap.ui.core.Control} oSourceControl: selected Item
	 * @private
	 */
	ABHelper.prototype._moveFocusOnSection = function (oSourceControl) {
		var oSourceData = oSourceControl.data(),
			oSection = sap.ui.getCore().byId(oSourceData.sectionId),
			oObjectPage = this.getObjectPageLayout();

		if (oSection && !oObjectPage.getUseIconTabBar()) {
			setTimeout(oSection.$()["focus"].bind(oSection.$()), this._iFocusMoveDelay);
		}
	};

	ABHelper.prototype._instantiateAnchorBarButton = function (bIsMenuButton, sAriaDescribedBy, sId) {
		var oButton = bIsMenuButton ? new MenuButton({
				type: "Transparent",
				buttonMode: "Split",
				useDefaultActionOnly: true,
				ariaDescribedBy: sAriaDescribedBy,
				id: sId
			}) : new Button({
				ariaDescribedBy: sAriaDescribedBy,
				id: sId
			});

		return oButton;
	};

	/**
	 * build an sap.m.button equivalent to a section or sub section for insertion in the anchorBar
	 * also registers the section info for further dom position updates
	 * @param oSectionBase
	 * @param {boolean} bIsSection
	 * @returns {null}
	 * @private
	 */
	ABHelper.prototype._buildAnchorBarButton = function (oSectionBase, bIsSection) {
		var oButtonClone = null,
			oObjectPageLayout = this.getObjectPageLayout(),
			oButton,
			oAnchorBar = this._getAnchorBar(),
			sId,
			bHasSubMenu,
			iVisibleSubSections,
			aSubSections = oSectionBase.getAggregation("subSections"),
			fnPressHandler = jQuery.proxy(oAnchorBar._handleDirectScroll, oAnchorBar);

		if (oSectionBase.getVisible() && oSectionBase._getInternalVisible()) {
			oButton = oSectionBase.getCustomAnchorBarButton();

			//by default we get create a button with the section title as text
			if (!oButton) {
				sId = oAnchorBar.getId() + "-" + oSectionBase.getId() + "-anchor";

				if (bIsSection) {
					if (aSubSections && aSubSections.length > 1) {
						iVisibleSubSections = aSubSections.filter(function (oSubSection) {
							return oSubSection.getVisible() && oSubSection._getInternalVisible();
						}).length;
					}
				}

				bHasSubMenu = bIsSection && iVisibleSubSections > 1 && oAnchorBar.getShowPopover();

				if (bHasSubMenu) {
					oButtonClone = this._instantiateAnchorBarButton(true, oSectionBase, sId);

					oButtonClone.attachDefaultAction(fnPressHandler);
					oButtonClone._getButtonControl().attachPress(function () {
						this.getParent().focus();
					});

					oButtonClone._getButtonControl().attachArrowPress(function () {
						var oButtonControl = oButtonClone._getButtonControl();

						if (this._aMenusWithAttachPressHandler[oButtonControl.getId()]) {
							return;
						}

						oButtonClone.getMenu().attachItemSelected(function (oEvent) {
							this._moveFocusOnSection(oEvent.getParameter("item"));
						}, this);

						this._aMenusWithAttachPressHandler[oButtonControl.getId()] = true;
					}, this);

					oButtonClone.addCustomData(new CustomData({
						key: "bHasSubMenu",
						value: true
					}));
				} else {
					oButtonClone = this._instantiateAnchorBarButton(false, oSectionBase, sId);
					oButtonClone.attachPress(fnPressHandler);
					oButtonClone.attachPress(function (oEvent) {
						this._moveFocusOnSection(oEvent.getSource());
					}, this);
				}

				//has a ux rule been applied that we need to reflect here?
				var sTitle = (oSectionBase._getInternalTitle() != "") ? oSectionBase._getInternalTitle() : oSectionBase.getTitle();
				oButtonClone.setText(sTitle);
			} else {
				oButtonClone = oButton.clone(); //keep original button parent control hierarchy
				oButtonClone.attachPress(fnPressHandler);
				oButtonClone.attachPress(function (oEvent) {
					this._moveFocusOnSection(oEvent.getSource());
				}, this);
				this._oObserver.observe(oButton, {
					properties: true
				});
			}

			//update the section info
			oObjectPageLayout._oSectionInfo[oSectionBase.getId()].buttonId = oButtonClone.getId();

			//the anchorBar needs to know the sectionId for automatic horizontal scrolling
			oButtonClone.addCustomData(new CustomData({
				key: "sectionId",
				value: oSectionBase.getId()
			}));

			//the anchorBar needs to know whether the title is actually displayed or not (so the anchorBar is really reflecting the objactPage layout state)
			oButtonClone.addCustomData(new CustomData({
				key: "bTitleVisible",
				value: oSectionBase._getInternalTitleVisible()
			}));

			if (!bIsSection) {
				//the anchorBar needs to know that this is a second section because it will handle responsive scenarios
				oButtonClone.addCustomData(new CustomData({
					key: "secondLevel",
					value: true
				}));
			}
		}

		return oButtonClone;
	};

	function fnCapitalize(sName) {
		return sName.substring(0, 1).toUpperCase() + sName.substring(1);
	}

	return ABHelper;

}, /* bExport= */ false);
