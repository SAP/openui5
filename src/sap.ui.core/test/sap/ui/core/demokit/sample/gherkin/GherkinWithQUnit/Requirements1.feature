Feature: Schrodinger's coffee
    Leave a barista in a box for a while with a nuclear isotope
    and a flask of poison that will be broken if the isotope
    releases an alpha particle. Open the box later and what do
    you see when the wave function collapses?

  Scenario: Buy expensive coffee when the barista is alive
  	Given I expect 1 assertion
  	Given that quantum phenomena exist at the macroscopic level
    Given that an alpha particle was not detected
    Then the flask of poison should be intact
    And I should expect a live barista

  Scenario: Buy expensive coffee when the barista is dead
    Given that quantum phenomena exist at the macroscopic level
    Given that an alpha particle was detected
    Then the flask of poison should be broken
    And I should expect a dead barista

  @wip
  Scenario: This scenario is a Work In Progress (WIP) and should be skipped
    Given that I am a mad scientist
    Given that I have a black hole generator
    And I generate a black hole
    Then the Earth will be consumed by a black hole
