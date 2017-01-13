Feature: Deep test harness behaviour

  This additional nested testing of the test harness is necessary because some of the tests fail.

  Scenario: Fail a test with no assertions
    Given I should be served a coffee

  @wip
  Scenario: Don't fail a test with no assertions, if it's @wip
    Given I should not fail even with no assertions

  Scenario: Pass a test with no assertions and expect(0)
    Given It's too late to drink coffee

  Scenario: Pass a test with 1 assertion and expect(1)
    Given coffee is best served espresso style

  Scenario: What once was lost now is NOT found
    Given this test step does not exist and should fail the build
    Then this test step will get skipped
