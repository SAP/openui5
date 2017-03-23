Feature: scenario outline tests

  Scenario Outline: given step definitions exist, Outline with no Examples will be skipped
    # step definition exists for the step below #
    Given the user '<USER>' has been given <NUMBER> cups of coffee

  Scenario Outline: given step definitions don't exist, Outlines with no Examples will still be skipped
    # no step definition exists for the step below #
    Given coffee originated in <ORIGIN> but was first brewed in <FIRST BREWED>
