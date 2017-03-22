Feature: Gherkin can load and test UIComponents

    UIComponents: the other test subject

  Scenario: UIComponents are important and not boring
    Given I start my UIComponent
    And   the UIComponent loads successfully
    When  I rename the button to "Hello World"
    Then  the button is named "Hello World"

