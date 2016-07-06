Feature: Page Navigation Journey
    If I click on a button, the app should navigate to the appropriate page

  Background:
    Given I start my app
    Given on the intro: I press on "Go to Overview"

  Scenario: Page 1 journey
    When on the overview: I press on "Go to Page 1"
    Then on page 1: I should see the page 1 text

  Scenario: Page 2 journey
    When on the overview: I press on "Go to Page 2"
    Then on page 2: I should see the page 2 text
