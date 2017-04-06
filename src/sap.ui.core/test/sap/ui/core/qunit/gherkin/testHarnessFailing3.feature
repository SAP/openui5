Feature: scenario outline tests

  Scenario Outline: given step definitions exist, Outline with no Examples will be skipped
    # step definition exists for the step below #
    Given the user '<USER>' has been given <NUMBER> cups of coffee

  Scenario Outline: given step definitions don't exist, Outlines with no Examples will still be skipped
    # no step definition exists for the step below #
    Given coffee originated in <ORIGIN> but was first brewed in <FIRST BREWED>

  Scenario Outline: A scenario outline with one Example that's @wip will be skipped
    Given the user '<USER>' has been given <NUMBER> cups of coffee

  @wip
  Examples:
    | USER     | NUMBER  |
    |  Alice   |  93     |
    |  Bob     |  5      |
    |  Charlie |  16     |

  Scenario Outline: A scenario outline with two Examples, one of which is @wip, will execute only the other one
    Given <PERSON> pays on average <AMOUNT> for a cup of coffee

  @wip
  Examples: ordinary people
    | PERSON   | AMOUNT   |
    |  Alice   |  $10 CAD |
    |  Bob     |  $6 USD  |
    |  Charlie |  16 EUR  |

  Examples: famous people
    | PERSON         | AMOUNT |
    |  Elvis         |  $1,200 USD |
    |  Vangelis      |  6,000 EUR  |
    |  Avril Lavigne |  $8.2M CAD  |

  Scenario Outline: a scenario outline with two Examples will execute them all
    Given <PERSON> pays on average <AMOUNT> for a cup of coffee

  Examples: ordinary people
    | PERSON   | AMOUNT   |
    |  Alice   |  $10 CAD |
    |  Bob     |  $6 USD  |
    |  Charlie |  16 EUR  |

  Examples: fictional people
    | PERSON                    | AMOUNT           |
    |  Philip J. Fry            |  12M Space Bucks |
    |  Turanga Leela            |  10M Space Bucks |
    |  Bender Bending Rodriguez |  6M Space Bucks  |