/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"./NavigationListItemBase"
], function (library, NavigationListItemBase) {
	"use strict";

	/**
	 * Constructor for a new NavigationListGroup.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NavigationListGroup represents a group of navigation actions, which can be selected by the user.
	 * @extends sap.tnt.NavigationListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.121
	 * @alias sap.tnt.NavigationListGroup
	 */
	const NavigationListGroup = NavigationListItemBase.extend("sap.tnt.NavigationListGroup", /** @lends sap.tnt.NavigationListGroup.prototype */ {
		metadata: {
			library: "sap.tnt",
			aggregations: {
				/**
				 * The sub items.
				 * @since 1.121.0
				 */
				items: { type: "sap.tnt.NavigationListItem", multiple: true, singularName: "item" }
			},
			defaultAggregation: "items"
		}
	});

	/**
	 * Renders the group.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @param {sap.tnt.NavigationList} oNavigationList control instance
	 * @param {boolean} bIsFirstGroup whether this group is the first of all groups
	 * @private
	 */
	NavigationListGroup.prototype.render = function (oRM, oNavigationList, bIsFirstGroup) {
		if (!this.getVisible() || !oNavigationList) {
			return;
		}

		const aItems = this.getItems(),
			bEnabled = this.getEnabled();

		// Render a preceding separator for the first group
		if (bIsFirstGroup) {
			this._renderSeparator(oRM);
		}

		if (!oNavigationList.getExpanded()) {
			aItems.forEach((oItem) => oItem.render(oRM, oNavigationList));
			this._renderSeparator(oRM);
			return;
		}

		oRM.openStart("li", this)
			.attr("role", "none")
			.openEnd();

		oRM.openStart("div")
			.class("sapTntNLI")
			.class("sapTntNLGroup");

		if (!bEnabled) {
			oRM.class("sapTntNLIDisabled");
		}

		const sSubtreeId = `${this.getId()}-subtree`;
		if (bEnabled) {
			oRM.attr("tabindex", "-1")
				.accessibilityState({
					role: "treeitem",
					owns: sSubtreeId,
					expanded: oNavigationList.getExpanded() && this.getExpanded() ? "true" : "false"
				});
		}

		oRM.openEnd();

		oRM.openStart("span")
			.class("sapTntNLGroupText")
			.openEnd()
			.text(this.getText())
			.close("span");

		oRM.renderControl(this._getExpandIconControl());

		oRM.close("div");

		oRM.openStart("ul", sSubtreeId)
			.class("sapTntNLIItemsContainer")
			.accessibilityState({
				role: "group",
				label: this.getText()
			});

		if (!this.getExpanded()) {
			oRM.class("sapTntNLIItemsContainerHidden");
		}

		oRM.openEnd();

		aItems.forEach((oItem) => oItem.render(oRM, oNavigationList));

		oRM.close("ul")
			.close("li");

		// Render one separator element after each group
		this._renderSeparator(oRM);
	};

	/**
	 * Renders a separator.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @param {sap.tnt.NavigationList} oNavigationList control instance
	 * @private
	 */
	NavigationListGroup.prototype._renderSeparator = function (oRM) {
		oRM.openStart("li")
			.class("sapTntNLSeparator")
			.attr("role", "none")
			.openEnd()
			.close("li");
	};

	/**
	 * Gets DOM references of the navigation items.
	 *
	 * @private
	 * @returns {Array<HTMLElement>} array of dom refs
	 */
	NavigationListGroup.prototype._getFocusDomRefs = function () {
		const oFocusRef = this.getFocusDomRef(),
			aDomRefs = this.getItems().flatMap((item) => item._getFocusDomRefs());

		if (!this.getEnabled() || !this.getVisible()) {
			return [];
		}

		if (this._isListExpanded()) {
			aDomRefs.unshift(oFocusRef);
		}

		return aDomRefs;
	};

	/**
	 * Gets DOM reference of the accessibility element.
	 *
	 * @private
	 * @returns {HTMLElement} dom ref
	 */
	NavigationListGroup.prototype._getAccessibilityRef = function () {
		return this.getDomRef().querySelector(".sapTntNLGroup");
	};

	NavigationListGroup.prototype._getExpandIconStyleClass = function () {
		return "sapTntNLGroupIcon";
	};

	NavigationListGroup.prototype._getExpanderActivationTarget = function () {
		return ".sapTntNLGroup";
	};

	return NavigationListGroup;
});