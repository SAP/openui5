#
# ${copyright}
##

Feature: Lemmings Have Names Now
    Are you tired of seeing lemmings throw themselves off of cliffs? One of the reasons this is happening is because
    they are severely depressed due to not having names. If you name a lemming it is 300% less likely to leap.

  Background:
    Given I have started the app
    And   I can see the life saving button

  Scenario: Named Lemmings Are Saved Lemmings
    Given I click on the life saving button 5 times
    Then I can see the following named lemmings:
      | Alice   |
      | Bob     |
      | Charlie |
      | David   |
      | Elektra |

  Scenario Outline: Using a Scenario Outline to Save Lemmings
    When I click on the life saving button
    Then I see <NAME> at the end of the list of named lemmings

  Examples:
      | NAME    |
      | Alice   |
      | Bob     |
      | Charlie |
