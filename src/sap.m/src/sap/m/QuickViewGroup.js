/*!
 * ${copyright}
 */

// Provides control sap.m.QuickViewGroup
sap.ui.define([
	"./library",
	"sap/ui/core/Element"
], function (library, Element) {
	"use strict";

	/**
	* Constructor for a new QuickViewGroup.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Initial settings for the new control
	*
	* @class QuickViewGroup consists of a title (optional) and an entity of group elements.
	*
	* @extends sap.ui.core.Element
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.28.11
	* @alias sap.m.QuickViewGroup
	*/
	var Group = Element.extend("sap.m.QuickViewGroup", /** @lends sap.m.QuickViewGroup.prototype */ {
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Determines whether the group is visible on the screen.
				 */
				visible : {
					type: "boolean",
					group : "Appearance",
					defaultValue: true
				},

				/**
				 * The title of the group
				 */
				heading: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				}
			},
			defaultAggregation: "elements",
			aggregations: {

				/**
				 * A combination of one label and another control (Link or Text) associated to this label.
				 */
				elements: {
					type: "sap.m.QuickViewGroupElement",
					multiple: true,
					singularName: "element",
					bindable: "bindable"
				}
			}
		}
	});

	["setModel", "bindAggregation", "setAggregation", "insertAggregation", "addAggregation",
		"removeAggregation", "removeAllAggregation", "destroyAggregation"].forEach(function (sFuncName) {
			Group.prototype[sFuncName] = function () {
				var result = Element.prototype[sFuncName].apply(this, arguments);

				var oPage = this.getParent();
				if (oPage) {
					oPage._updatePage();
				}

				if (["removeAggregation", "removeAllAggregation"].indexOf(sFuncName) !== -1) {
					return result;
				}

				return this;
			};
		});

	Group.prototype.setProperty = function () {
		Element.prototype.setProperty.apply(this, arguments);

		var oPage = this.getParent();
		if (oPage) {
			oPage._updatePage();
		}

		return this;
	};

	Group.prototype.getQuickViewBase = function () {
		var oParent = this.getParent();
		if (oParent && oParent.getQuickViewBase) {
			return oParent.getQuickViewBase();
		}
		return null;
	};

	return Group;
});