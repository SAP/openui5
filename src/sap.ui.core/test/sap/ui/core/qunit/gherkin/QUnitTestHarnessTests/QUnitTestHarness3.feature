#
# ${copyright}
##

@wip
Feature: Coffee is free
    People have been paying for coffee for so long
    Let's take pitty on them and offer great coffee
    for free!

  Scenario: Convince world leaders to free coffee
    Given that world leaders like coffee
    Then it should be easy to convince them to free coffee
    But perhaps taxpayers don't want to payroll this
  
  # do the same scenario twice to show that it doesn't matter if they have the same name, the test still passes
  Scenario: Convince world leaders to free coffee
    Given that world leaders like coffee
    Then it should be easy to convince them to free coffee
    But perhaps taxpayers don't want to payroll this
    
