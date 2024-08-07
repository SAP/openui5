/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/base/Object",
	"sap/ui/base/ManagedObjectObserver",
	"sap/m/IconTabFilter",
	"sap/m/IconTabHeader",
	"sap/m/library",
	"sap/uxap/ObjectPageSection"
], function(Element, BaseObject, ManagedObjectObserver, IconTabFilter, IconTabHeader, mobileLibrary, ObjectPageSection) {
	"use strict";

	// shortcut for sap.m.TabsOverflowMode
	var TabsOverflowMode = mobileLibrary.TabsOverflowMode;
	// shortcut for sap.m.IconTabHeaderMode
	var IconTabHeaderMode = mobileLibrary.IconTabHeaderMode;

	var ABHelper = BaseObject.extend("sap.uxap._helpers.AB", {
		/**
		 * @private
		 * @param {sap.uxap.ObjectPageLayout} oObjectPageLayout Object Page layout instance
		 */
		constructor: function (oObjectPageLayout) {
			this._oObjectPageLayout = oObjectPageLayout;
			this._oObserver = new ManagedObjectObserver(this._proxyStateChanges.bind(this));
		},
		getInterface: function() {
			return this; // no facade
		}
	});

	/** STATIC MEMBERS **/

	/**
	 * @static
	 * @param {sap.uxap.ObjectPageSectionBase} oSection the section or subsection to be focused
	 * @param {object} oParams a params object to be passed to the focus call
	 * @private
	 */
	ABHelper._focusSection = function (oSection, oParams) {
		var oSectionDomRef = oSection.getDomRef();

		if (oSectionDomRef) {
			oSectionDomRef.focus(oParams);
		}
	};

	ABHelper.prototype.getObjectPageLayout = function () {
		return this._oObjectPageLayout;
	};

	/**
	 * Lazy loads the hidden Aggregation "_anchorBar"
	 * @returns {sap.uxap.AnchorBar} AnchorBar
	 * @private
	 */
	ABHelper.prototype._getAnchorBar = function () {
		var oObjectPageLayout = this.getObjectPageLayout(),
			oAnchorBar = oObjectPageLayout.getAggregation("_anchorBar"),
			bUpperCaseAnchors = oObjectPageLayout.getUpperCaseAnchorBar();

		if (!oAnchorBar) {

			oAnchorBar = new IconTabHeader({
				id: oObjectPageLayout.getId() + "-anchBar",
				tabsOverflowMode: TabsOverflowMode.StartAndEnd,
				backgroundDesign: oObjectPageLayout.getBackgroundDesignAnchorBar(),
				mode: IconTabHeaderMode.Inline
			});

			oAnchorBar.attachSelect(function(oEvent) {
				var sSectionId = oEvent.getParameter("key");
				this._moveFocusOnSection(sSectionId);
				oObjectPageLayout.onAnchorBarTabPress(sSectionId);
			}.bind(this));

			oAnchorBar.addEventDelegate({
				onAfterRendering: oObjectPageLayout._adjustTitlePositioning.bind(oObjectPageLayout)
			});

			if (bUpperCaseAnchors) {
				oAnchorBar.addStyleClass("sapUxAPAnchorBarUpperCase");
			}

			this.getObjectPageLayout().setAggregation("_anchorBar", oAnchorBar, true);
		}

		return oAnchorBar;
	};

	/**
	 * build the anchorBar and all the anchorBar buttons
	 * @private
	 */
	ABHelper.prototype._buildAnchorBar = function () {
		var oObjectPage = this.getObjectPageLayout(),
			oIconTabHeader = this._getAnchorBar(),
			bUpperCase = oObjectPage.getUpperCaseAnchorBar();

		this.resetControl();
		this._oObserver.disconnect(); // unobrveserve all previousy obsed objects

		oObjectPage._getVisibleSections().forEach(function (oSection) {
			var sSectionFilterId = oIconTabHeader.getId() + "-" + oSection.getId() + "-anchor",
				oSectionFilter = new IconTabFilter(sSectionFilterId, {
					text: oSection._getTitle(),
					key: oSection.getId(),
					iconColor: oSection.getAnchorBarButtonColor()
				}),
				aSubSections = oSection._getVisibleSubSections();

			this._setupCustomButtonForwarding(oSection, oSectionFilter, bUpperCase);

			if (oObjectPage.getShowAnchorBarPopover()) {
				if (aSubSections.length > 1) {
					aSubSections.forEach(function (oSubSection) {
						var sSubSectionFilterId = oIconTabHeader.getId() + "-" + oSubSection.getId() + "-anchor",
							oSubSectionFilter = new IconTabFilter(sSubSectionFilterId, {
							text: oSubSection._getTitle(),
							key: oSubSection.getId()
						});

						oSectionFilter.addItem(oSubSectionFilter);
						this._setupCustomButtonForwarding(oSubSection, oSubSectionFilter);
					}, this);
				} else if (aSubSections.length === 1 && !oSection.getCustomAnchorBarButton() && aSubSections[0]._getTitle()?.trim()) { // promoted section
					oSectionFilter.setText(aSubSections[0]._getTitle());
					this._setupCustomButtonForwarding(aSubSections[0], oSectionFilter, bUpperCase);
				}
			}

			oIconTabHeader.addItem(oSectionFilter);
		}, this);
		oObjectPage.setAggregation("_anchorBar", oIconTabHeader);
	};

	ABHelper.prototype._setupCustomButtonForwarding = function (oSectionBase, oSectionBaseTab, bUpperCase) {
		var oCustomAnchorBarButton = oSectionBase.getCustomAnchorBarButton();
		if (!oCustomAnchorBarButton) {
			return;
		}
		// set initial property values
		oSectionBaseTab.setText(oCustomAnchorBarButton.getText());
		oSectionBaseTab.setIcon(oCustomAnchorBarButton.getIcon());

		// forward updates to property values
		this._oObserver.observe(oCustomAnchorBarButton, {
			properties: true
		});

		// forward press event
		this._getAnchorBar().attachSelect(function(oEvent) {
			this.forwardPressToCustomButton(oEvent.getParameter("item"));
		}, this);
	};

	ABHelper.prototype._forwardPressToCustomButton = function (oPressedAnchor) {
		var sSectionBaseId = oPressedAnchor.getKey(),
			oSectionBase = Element.getElementById(sSectionBaseId),
			oCustomButton = oSectionBase?.getCustomAnchorBarButton();

		if (oCustomButton) {
			oCustomButton.firePress();
		}
	};

	ABHelper.prototype.resetControl = function () {
		this._getAnchorBar().destroyItems();
	};

	ABHelper.prototype.selectAnchorForSection = function (sId) {
		var oSectionBase = Element.getElementById(sId),
			bIsSubsection;

		if (!oSectionBase) {
			return;
		}

		bIsSubsection = oSectionBase.isA("sap.uxap.ObjectPageSubSection");

		if (bIsSubsection) {
			sId = oSectionBase.getParent().getId();
		}


		this._getAnchorBar().setSelectedKey(sId);
	};

	ABHelper.prototype._setAnchorButtonsTabFocusValues = function (sSelectedKey) {
		var aAnchorBarContent = this._getAnchorBar().getItems(),
			$anchorBarItem,
			sFocusable = '0',
			sNotFocusable = '-1',
			sTabIndex = "tabIndex";

		aAnchorBarContent.forEach(function (oAnchorBarItem) {
			$anchorBarItem = oAnchorBarItem.$();
			if (oAnchorBarItem.getKey() === sSelectedKey) {
				$anchorBarItem.attr(sTabIndex, sFocusable);
			} else {
				$anchorBarItem.attr(sTabIndex, sNotFocusable);
			}
		});
	};

	/**
	 * Moves focus on the corresponding subsection when MenuItem is selected
	 * @param {sap.ui.core.Control} oSourceControl selected Item
	 * @private
	 */
	ABHelper.prototype._moveFocusOnSection = function (sectionId) {
		var oSectionBase = Element.getElementById(sectionId),
			oSection,
			oSectionFilter,
			oFocusParams = { preventScroll: true },
			oDelegate;

		if (!oSectionBase) {
			return;
		}

		if (!oSectionBase.isActive()) {
			// with IconTabBar section may not be rendered
			oDelegate = {
				"onAfterRendering": function () {
					oSectionBase.removeEventDelegate(oDelegate);
					ABHelper._focusSection(oSectionBase, oFocusParams);
				}
			};

			oSectionBase.addEventDelegate(oDelegate);
			return;
		}

		oSection = ObjectPageSection._getClosestSection(oSectionBase);
		oSectionFilter = this._getAnchorBar().getItems().find((i) => i.getKey() === oSection.getId());

		if (document.activeElement !== oSectionFilter.getDomRef()) {

				oDelegate = {
					"onfocusin": function () {
						oSectionFilter.removeEventDelegate(oDelegate);
						ABHelper._focusSection(oSectionBase, oFocusParams);
					}
				};
				oSectionFilter.addEventDelegate(oDelegate);
		}

		ABHelper._focusSection(oSectionBase, oFocusParams);
	};

	ABHelper.prototype._proxyStateChanges = function (oChanges) {
		var oObject = oChanges.object,
			oSectionBase = oObject.getParent(),
			oSectionBaseAnchor = this._findAnchorForSectionBase(oSectionBase),
			sPropertyName = oChanges.name,
			vCurrentValue = oChanges.current,
			sSetter = "set" + fnCapitalize(sPropertyName);

			if (oSectionBaseAnchor) {
				oSectionBaseAnchor[sSetter].call(oSectionBaseAnchor, vCurrentValue);
			}
	};

	ABHelper.prototype._findAnchorForSectionBase = function (oSectionBase) {
		var sSectionBaseId = oSectionBase?.getId(),
			oAnchorBar = this._getAnchorBar(),
			aAnchors = oAnchorBar.getItems(),
			oSelectedAnchor,
			fnFindAnchor = function(oItems) {
				return oItems.some(function(oItem) {
					if (oItem.getKey() === sSectionBaseId) {
						oSelectedAnchor = oItem;
						return true;
					}
					return fnFindAnchor(oItem.getItems());
				});
			};

		fnFindAnchor(aAnchors);
		return oSelectedAnchor;
	};

	function fnCapitalize(sName) {
		return sName.substring(0, 1).toUpperCase() + sName.substring(1);
	}

	return ABHelper;

});