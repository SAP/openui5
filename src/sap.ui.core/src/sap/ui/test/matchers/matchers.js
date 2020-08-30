/*!
 * ${copyright}
 */

// private
// require all matchers
sap.ui.define([
	'sap/ui/test/matchers/AggregationContainsPropertyEqual',
	'sap/ui/test/matchers/AggregationEmpty',
	'sap/ui/test/matchers/AggregationFilled',
	'sap/ui/test/matchers/AggregationLengthEquals',
	'sap/ui/test/matchers/Ancestor',
	'sap/ui/test/matchers/BindingPath',
	'sap/ui/test/matchers/Descendant',
	'sap/ui/test/matchers/I18NText',
	'sap/ui/test/matchers/Interactable',
	'sap/ui/test/matchers/LabelFor',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/matchers/Sibling',
	'sap/ui/test/matchers/Visible'
], function (
	AggregationContainsPropertyEqual,
	AggregationEmpty,
	AggregationFilled,
	AggregationLengthEquals,
	Ancestor,
	BindingPath,
	Descendant,
	I18NText,
	Interactable,
	LabelFor,
	Properties,
	PropertyStrictEquals,
	Sibling,
	Visible
) {
	"use strict";

	return {
		aggregationContainsPropertyEqual: AggregationContainsPropertyEqual,
		aggregationEmpty: AggregationEmpty,
		aggregationFilled: AggregationFilled,
		aggregationLengthEquals: AggregationLengthEquals,
		ancestor: Ancestor,
		bindingPath: BindingPath,
		descendant: Descendant,
		i18NText: I18NText,
		interactable: Interactable,
		labelFor: LabelFor,
		properties: Properties,
		propertyStrictEquals: PropertyStrictEquals,
		sibling: Sibling,
		visible: Visible
	};
});
