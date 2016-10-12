Feature: Safe a product for later

  Background:
    Given I start my App safe for later activated
    When on home: I press on "The second category"
    When on the category: I press on "The first Product"
    When on the product: I add the displayed product to the cart
    When on the category: I go to the cart page
    When on the cart: I press on safe for later for the first product

  Scenario: Safe for later
    Then on the cart: I should see one product in my safe for later list
    Then I should see an empty cart

