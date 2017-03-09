Feature: Open the Light Box for a picture

  Background:
    Given I start my App
    When on home: I press on "The second category"
    When on the category: I press on "The first Product"

  Scenario: Open the light box of a product picture
    When on the product: I press on the product picture
    Then on the product: I should see a light box
    When on the product: I press the close button of the light box