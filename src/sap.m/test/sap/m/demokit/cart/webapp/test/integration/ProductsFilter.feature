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
	When on the category: I filter on Price
	Then on the category: I should only see expensive products and an info toolbar
	When on the category: I remove the price filter
	Then on the category: I should see all products and no Info Toolbar
	When on the category: I filter on availability and price
	Then on the category: I should only see out of stock and cheap products with info toolbar
	Then on the category: I teardown my app
