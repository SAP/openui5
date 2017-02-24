Feature: Set the availability filter

  Background:
    Given I start my App
    When on home: I press on "The second category"
    When on the category: I press on "The first Product"

  Scenario: Set availability filter for products
    When on the category: I press the availability filter toggle button
    Then on the category: I should only see available products
    When on the category: I press the availability filter toggle button
    Then on the category: I should see all products of the category