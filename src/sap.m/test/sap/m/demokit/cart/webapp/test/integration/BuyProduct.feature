Feature: Buy a Product

  Background:
    Given I start my App

  Scenario: Buy it
    When on home: I press on "The second category"
    When on the category: I press on "The first Product"
    When on the product: I add the displayed product to the cart
    When on the category: I go to the cart page
    When on the cart: I press on the proceed button
    When on the cart: I fill the form
    When on the cart: I press order now
    When on Home: I go to the cart page
    Then on the cart: I should see an empty cart