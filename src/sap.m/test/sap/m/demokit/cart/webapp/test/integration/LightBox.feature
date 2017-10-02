Feature: Open the Light Box for a picture

  Background:
    Given I start my App

  Scenario: Open the light box of a product picture
    When on the welcome page: I press the product image
    Then on the welcome page: I should see the product in light box
    When on the welcome page: I press the close button of the light box
