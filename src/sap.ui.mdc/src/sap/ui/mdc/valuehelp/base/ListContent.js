/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/Content',
	'sap/ui/mdc/enums/ConditionValidated'
], function(
	Content,
	ConditionValidated
) {
	"use strict";

	/**
	 * Constructor for a new <code>ListContent</code>.
	 *
	 * This is the basis for various types of value help list content. It cannot be used directly.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element.
	 * @extends sap.ui.mdc.valuehelp.base.Content
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @public
	 * @since 1.95.0
	 * @alias sap.ui.mdc.valuehelp.base.ListContent
	 */
	const ListContent = Content.extend("sap.ui.mdc.valuehelp.base.ListContent", /** @lends sap.ui.mdc.valuehelp.base.ListContent.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * If this property is set to <code>true</code>, the filtering for user input is always case-sensitive.
				 * Otherwise user input is checked case-insensitively.
				 * If <code>$search</code> is used, this property has no effect on the <code>$search</code> request.
				 *
				 * If the used back-end service supports a case-insensitive search, set this property to <code>false</code>.
				 */
				caseSensitive: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * If set, <code>getItemForValue</code> returns the first item that matches the text.
				 *
				 * This is the case if the text of the item starts with the text entered.
				 */
				 useFirstMatch: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * If set, the list is opened whenever the value help icon is pressed.
				 */
				 useAsValueHelp: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true // TODO - right default?
				}
			},
			aggregations: {
			},
			events: {
			}
		}
	});

	ListContent.prototype.init = function() {

		Content.prototype.init.apply(this, arguments);

		this._oObserver.observe(this, {
			properties: ["caseSensitive"]
		});

	};

	ListContent.prototype.observeChanges = function(oChanges) {

		if (oChanges.name === "caseSensitive") {
			this.handleFilterValueUpdate(oChanges);
		}

		Content.prototype.observeChanges.apply(this, arguments);

	};

	ListContent.prototype.getCount = function (aConditions) {
		let iCount = 0;

		for (let i = 0; i < aConditions.length; i++) {
			const oCondition = aConditions[i];
			if (oCondition.isEmpty !== true && oCondition.validated === ConditionValidated.Validated) {
				iCount++;
			}
		}
		return iCount;
	};

	/**
	 * Gets the <code>ListBinding</code> of the content.
	 * @returns {sap.ui.model.ListBinding} <code>ListBinding</code>
	 * @protected
	 */
	ListContent.prototype.getListBinding = function () {
		throw new Error("ListContent: Every listcontent must implement this method.");
	};

	/**
	 * Gets the relevant <code>BindingContexts</code> of the content.
	 * @param {sap.ui.mdc.valuehelp.base.ItemForValueConfiguration} oConfig
	 * @returns {sap.ui.model.Context[]} <code>BindingContexts</code>
	 * @protected
	 */
	ListContent.prototype.getRelevantContexts = function(oConfig) {
		throw new Error("ListContent: Every listcontent must implement this method.");
	};

	return ListContent;

});
