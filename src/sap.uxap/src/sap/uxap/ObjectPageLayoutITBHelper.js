/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/Metadata",
	"sap/m/IconTabBar",
	"sap/ui/core/CustomData",
	"sap/m/IconTabFilter"
], function (jQuery, Metadata, IconTabBar, CustomData, IconTabFilter) {
	"use strict";

	var ITBHelper = Metadata.createClass("sap.uxap._helpers.ITB", {
		/**
		 * @private
		 * @param {sap.uxap.ObjectPageLayout} oObjectPageLayout Object Page layout instance
		 */
		constructor: function (oObjectPageLayout) {
			this._oObjectPageLayout = oObjectPageLayout;
		}
	});

	ITBHelper.prototype.getObjectPageLayout = function () {
		return this._oObjectPageLayout;
	};

	/**
	 * update the IconTabBar after structural changes in the 'section' aggregation
	 */
	ITBHelper.prototype._updateIconTabBar = function () {
		if (!this.getObjectPageLayout().isFirstRendering() && this.getObjectPageLayout().getUseIconTabBar()) {
			this._buildIconTabBar();
		}
	};

	/**
	 * Builds the 'item' aggregation of the sap.m.IconTabBar
	 * @private
	 */
	ITBHelper.prototype._buildIconTabBar = function () {
		var oIconTabBarFilter,
			sSelectedIconTabBarKey,
			aSections = this.getObjectPageLayout().getSections() || [],
			oIconTabBar = this._getIconTabBar(),
			bIsFirstRendering = this.getObjectPageLayout().isFirstRendering();

		oIconTabBar.removeAllItems();

		if (aSections.length <= 1) {
			return;
		}

		aSections.forEach(function (oSection) {
			if (bIsFirstRendering && (!oSection.getVisible() || !oSection._getInternalVisible())) {
				return;
			}

			oIconTabBarFilter = new IconTabFilter({
				text: oSection.getTitle()
			});

			// always select the first IconTabBarFilter by default
			if (!sSelectedIconTabBarKey) {
				sSelectedIconTabBarKey = oIconTabBarFilter.getId();
				oIconTabBar.setSelectedKey(sSelectedIconTabBarKey);
			}

			// bind the corresponding section to the IconTabFilter
			oIconTabBarFilter.addCustomData(new CustomData({
				key: 'selectedSection',
				value: oSection
			}));

			oIconTabBar.addItem(oIconTabBarFilter);

			if (this.getObjectPageLayout()._oSectionInfo[oSection.getId()]) {
				this.getObjectPageLayout()._oSectionInfo[oSection.getId()].filterId = oIconTabBarFilter.getId();
			}

		}, this);
	};


	/**
	 * Lazy loads the hidden Aggregation "_iconTabBar"
	 * @returns {sap.m.IconTabBar}
	 * @private
	 */
	ITBHelper.prototype._getIconTabBar = function () {
		var oIconTabBar = this.getObjectPageLayout().getAggregation("_iconTabBar");

		if (!oIconTabBar) {
			var fnShowSelectedSection = this._showSelectedSection.bind(this),
				fnGetSelectedSectionByTabKey = this._getSelectedSectionByTabKey.bind(this);

			oIconTabBar = new IconTabBar(this.getObjectPageLayout().getId() + "-iconTabBar", {
				expandable: false,
				applyContentPadding: false
			});

			// Overwrite IconTabBar setSelectedKey() public method in order to show the corresponding section
			oIconTabBar.setSelectedKey = function (sTabKey) {
				var oSelectedSection = fnGetSelectedSectionByTabKey(sTabKey);
				fnShowSelectedSection(oSelectedSection);

				return IconTabBar.prototype.setSelectedKey.call(this, sTabKey);
			};

			oIconTabBar.attachSelect(this._onIconTabFilterSelect, this);

			this.getObjectPageLayout().setAggregation("_iconTabBar", oIconTabBar);
		}

		return oIconTabBar;
	};

	/**
	 * Handles IconTabBar select event
	 * @param oEvent
	 * @private
	 */
	ITBHelper.prototype._onIconTabFilterSelect = function (oEvent) {
		var sTabKey = oEvent.getParameter('selectedKey');
		var oSelectedSection = this._getSelectedSectionByTabKey(sTabKey);
		this._showSelectedSection(oSelectedSection);
	};

	/**
	 * Shows the selected section
	 * @param oSelectedSection
	 * @private
	 */
	ITBHelper.prototype._showSelectedSection = function (oSelectedSection) {
		if (this._oSelectedSection && this._oSelectedSection !== oSelectedSection) {
			this._renderSection(oSelectedSection);
			this._oSelectedSection = oSelectedSection;

			if (this.getObjectPageLayout()._bStickyAnchorBar) {
				var iScrollDuration = 0;
				this.getObjectPageLayout().scrollToSection(oSelectedSection.sId, iScrollDuration);
			}
		}
	};

	/**
	 * Retrieves the section, which the selected tab refers to
	 * @param sTabKey
	 * @private
	 */
	ITBHelper.prototype._getSelectedSectionByTabKey = function (sTabKey) {
		return sap.ui.getCore().byId(sTabKey).data('selectedSection');
	};

	/**
	 * Sets sections` initial visibility state only when the IconTabBar is used as a navigation bar,
	 * the initial state is the following: the first section stays visible, the other sections goes hidden
	 * TODO: this function may not be necessary
	 * @private
	 */
	ITBHelper.prototype._setFacetInitialVisibility = function () {
		var aSections = this.getObjectPageLayout().getSections(),
			bIsFirstRendering = this.getObjectPageLayout().isFirstRendering(),
			oIconTabBar = this._getIconTabBar(),
			oInititalSelectedTab = null;

		this._oSelectedSection = null;

		aSections.forEach(function (oSection) {
			if (bIsFirstRendering && (!oSection.getVisible() || !oSection._getInternalVisible())) {
				return;
			}

			if (!this._oSelectedSection) {
				this._oSelectedSection = oSection;
				oSection.setProperty('visible', true, false); // always show the first visible section by default
			} else {
				if (this._oSelectedSection !== oSection) {
					oSection.setProperty('visible', false, false);
				}
			}

			// Reset IconTabBar Tab Selection
			if (!oInititalSelectedTab) {
				oInititalSelectedTab = oIconTabBar.getItems()[0];
				oIconTabBar.setSelectedKey(oInititalSelectedTab.getId());
			}
		}, this);
	};

	/**
	 * renders the given section in the ObjectPageContainer html element, without causing re-rendering of the ObjectPageLayout,
	 * used for switching between sections, when the navigation is through IconTabBar
	 * @param oSection
	 * @private
	 */
	ITBHelper.prototype._renderSection = function (oSection) {
		var oRm = sap.ui.getCore().createRenderManager();
		var $objectPageContainer = this.getObjectPageLayout()._getContainerElement();

		if (oSection && $objectPageContainer) {
			oSection.setProperty('visible', true, true); // suppress the invalidation
			oRm.renderControl(oSection);
			oRm.flush($objectPageContainer);// place the section in the ObjectPageContainer
		}

		oRm.destroy();
	};

	ITBHelper._enrichPrototypeWithITBMutators = function (fnClass) {

		/**
		 * Overriding 'addSection'
		 * @param oSection sap.uxap.Section
		 */
		fnClass.prototype.addSection = function (oSection) {
			var vResult = this.addAggregation("sections", oSection);
			this._oITBHelper._updateIconTabBar();

			return vResult;
		};

		/**
		 * Overriding 'insertSection'
		 * @param oSection sap.uxap.Section
		 * @param iIndex
		 */
		fnClass.prototype.insertSection = function (oSection, iIndex) {
			var vResult = this.insertAggregation("sections", oSection, iIndex);
			this._oITBHelper._updateIconTabBar();

			return vResult;
		};

		/**
		 * Overriding 'removeSection'
		 * @param oSection sap.uxap.Section
		 */
		fnClass.prototype.removeSection = function (oSection) {
			var vResult = this.removeAggregation("sections", oSection);
			this._oITBHelper._updateIconTabBar();

			return vResult;
		};

		/**
		 * Overriding 'removeAllSections'
		 */
		fnClass.prototype.removeAllSections = function () {
			var vResult = this.removeAllAggregation("sections");
			this._oITBHelper._updateIconTabBar();

			return vResult;
		};

		/**
		 * Overriding 'destroySections'
		 */
		fnClass.prototype.destroySections = function () {
			var vResult = this.destroyAggregation("sections");
			this._oITBHelper._updateIconTabBar();

			return vResult;
		};

	};

	return ITBHelper;

}, /* bExport= */ false);
