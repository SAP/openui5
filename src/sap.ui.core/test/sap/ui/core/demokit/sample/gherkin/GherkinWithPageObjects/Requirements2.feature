Feature: Opa Page Objects + Step Definitions
    Test the app using Gherkin Step Definitions, which allows for even
    greater convenience and programming power.

  Background:
    Given I start my app
    Given on the intro: I press on "Go to Overview"

  Scenario Outline: Test both pages at once using a scenario outline
    When on the overview: I press on "Go to Page <PAGE_NUM>"
    Then on page <PAGE_NUM> I should see the text "This is Page <PAGE_NUM>"

    Examples:
      | PAGE_NUM |
      | 1        |
      | 2        |

  Scenario: Page 1 journey with lots of text fields
    When on the overview: I press on "Go to Page 1"
    Then I should see the following fields:
      | Name   | Value          |
      | label1 | More Text      |
      | label2 | Even More Text |
