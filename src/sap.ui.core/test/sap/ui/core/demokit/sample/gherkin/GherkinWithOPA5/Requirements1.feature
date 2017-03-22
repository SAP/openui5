Feature: Clicking Buttons Is a Life Saving Activity
    Clicking buttons saves lemmings' lives. For the mere cost of a cheap home PC you
    can save thousands of lemmings daily by clicking buttons all day long.

  Background:
    Given I have started the app
    And   I can see the life saving button

  Scenario: Click a button, save a life!
    Given I check how many lemmings have been saved already
    When  I click on the life saving button
    Then  I save a lemming's life

  Scenario: The saved lemming has a name
    When I click on the life saving button
    Then I see Alice at the end of the list of named lemmings

  @wip
  Scenario: Lemmings don't really throw themselves off cliffs
    Given there was a documentary of lemmings throwing themselves off a cliff
    Given this film greatly affected people's perception of lemmings
    Given this part of the film was faked
    Then we expect the myth of suicide lemmings to persist despite its falsity
