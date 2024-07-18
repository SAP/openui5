/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/Content', 'sap/ui/mdc/enums/ConditionValidated'
], (
	Content,
	ConditionValidated
) => {
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
	const ListContent = Content.extend("sap.ui.mdc.valuehelp.base.ListContent", /** @lends sap.ui.mdc.valuehelp.base.ListContent.prototype */ {
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
				 * In the default implementation, this is the first item that matches the entered text. Which item is used can be determined
				 * by implementing {@link module:sap/ui/mdc/ValueHelpDelegate.getFirstMatch getFirstMatch}.
				 *
				 * The matching item is returned in the <code>typeaheadSuggested</code> event and used for the autocomplete feature in the connected field.
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
			aggregations: {},
			events: {}
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

	ListContent.prototype.getCount = function(aConditions) {
		let iCount = 0;

		for (const oCondition of aConditions) {
			if (oCondition.isEmpty !== true && oCondition.validated === ConditionValidated.Validated) {
				iCount++;
			}
		}

		return iCount;
	};

	/**
	 * Gets current keyPath of the content.
 	 * <b>Note:</b> Every listcontent must implement this method.
	 * @name sap.ui.mdc.valuehelp.base.ListContent#getKeyPath
	 * @method
	 * @abstract
	 * @returns {string} Content key path
	 * @public
	 */

	/**
	 * Gets current descriptionPath of the content.
 	 * <b>Note:</b> Every listcontent must implement this method.
	 * @name sap.ui.mdc.valuehelp.base.ListContent#getDescriptionPath
	 * @method
	 * @abstract
	 * @returns {string} Content description path
 	 * @public
	 */

	/**
	 * Gets the <code>ListBinding</code> of the content.
  	 * <b>Note:</b> Every listcontent must implement this method.
	 * @name sap.ui.mdc.valuehelp.base.ListContent#getListBinding
	 * @method
	 * @abstract
	 * @returns {sap.ui.model.ListBinding} <code>ListBinding</code>
	 * @public
	 */

	/**
	 * Gets an item for a <code>BindingContext</code>.
	 * @param {sap.ui.model.Context} oBindingContext BindingContext
	 * @param {object} [oOptions] Options
	 * @name sap.ui.mdc.valuehelp.base.ListContent#getItemFromContext
	 * @method
	 * @abstract
	 * @returns {object} Item object containing <code>key</code>, <code>description</code>, and <code>payload</code>
	 * @protected
	 */

	return ListContent;

});