Feature: Opa Page Objects + Step Definitions
    Test the app using Gherkin Step Definitions, which allows for even
    greater convenience and programming power.

  Background:
    Given I start my app
    Given on the intro: I press on "Go to Overview"

  Scenario: Page 1 journey with lots of text fields
    When on the overview: I press on "Go to Page 1"
    Then I should see the following fields:
      | Name   | Value          |
      | label1 | More Text      |
      | label2 | Even More Text |