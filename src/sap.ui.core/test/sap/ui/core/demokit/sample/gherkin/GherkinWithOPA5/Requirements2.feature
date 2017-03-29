Feature: Lemmings Have Names Now
    Are you tired of seeing lemmings throw themselves off of cliffs? One of the reasons
    this is happening is because they are severely depressed due to not having names.
    If you name a lemming it is 300% less likely to leap.

  Background:
    Given I have started the app
    And   I can see the life saving button

  Scenario: Save lemmings with one row of data
    When I click on the life saving button 5 times
    Then I can see the following named lemmings:
      | Alice | Bob | Charlie | David | Elektra |

  Scenario: Save lemmings with one column of data
    When I click on the life saving button 5 times
    Then I can see the following named lemmings:
      | Alice   |
      | Bob     |
      | Charlie |
      | David   |
      | Elektra |

  Scenario: Save lemmings with one element of data
    When I click on the life saving button
    Then I can see the following named lemmings:
      | Alice |

  Scenario Outline: Using a Scenario Outline to Save Lemmings
    When I click on the life saving button <NUM_CLICKS> times
    Then I see <NAME> at the end of the list of named lemmings

    Examples:
      | NUM_CLICKS | NAME    |
      |  1         | Alice   |
      |  2         | Bob     |

    Examples: second set
      | NUM_CLICKS | NAME    |
      |  3         | Charlie |

    @wip
    Examples: third set (are the names even correct?)
      | NUM_CLICKS | NAME    |
      |  4         | Delta   |
      |  5         | Echo    |
      |  6         | Foxtrot |
