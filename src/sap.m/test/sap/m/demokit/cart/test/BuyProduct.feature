Feature: Buy a Product

  Background:
    Given I start my App

  Scenario: Buy it
    When on home: I press on "The second category"
    When on the category: I press on "The first Product"
    When on the product: I add the displayed product to the cart
    When on the category: I go to the cart page
    When i press on the proceed button
    When i fill the form
    When i press order now
    When i go to the cart page
    Then i should see an empty cart