Feature: Products filters

  Background:
	Given I start my App

  Scenario: Set and remove products filter

	When on home: I press on the Flat Screens category
	Then on the category: I should see a filter button

	When on the category: I filter on availability
	Then on the category: I should only see available and discontinued products with info toolbar

	When on the category: I remove the availability filters
	Then on the category: I should see all products and no info toolbar

	When on the category: I filter on availability and price
	Then on the category: I should only see out of stock and cheap products with info toolbar

	When on the category: I cancel a price filter change
	Then on the category: I should only see out of stock and cheap products with Info toolbar

	When on the category: I press the filter button
	When on the category: I press the back button in dialog
	When on the category: I change to the default filter price values

	Then on the category: I should only see out of stock products and an info toolbar

	When on the category: I press the filter button
	When on the category: I press reset button
	When on the category: I press ok button

	Then on the category: I should see all products and no info toolbar

	When on the category: I filter on supplier
	Then on the category: I should only see techno Com products and an info toolbar

	When on the category: I remove the supplier filter
	Then on the category: I should see all products and no info toolbar
	Then on the category: I teardown my app
