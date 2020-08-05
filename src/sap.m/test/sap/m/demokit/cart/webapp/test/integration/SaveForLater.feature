Feature: Save a product for later

  Background:
    Given I start my App
    When on home: I press on "The Flat Screens category"
    When on the category: I press on "The first Product"
    When on the product: I add the displayed product to the cart
    When on the product: I toggle the cart
    When on the cart: I press on save for later for the first product

  Scenario: Save for later
    Then on the cart: I should see one product in my save for later list
    Then on the cart: I should see an empty cart

  Scenario: Add back to cart
    When on the cart: I press on add back to basket for the first product

    Then on the cart: I should see the product in my cart
    Then on the cart: I should not see a save for later footer
    Then on the cart: I should see an empty save for later list

