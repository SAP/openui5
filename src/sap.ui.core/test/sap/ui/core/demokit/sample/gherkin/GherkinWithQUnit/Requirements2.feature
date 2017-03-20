Feature: Coffee is very expensive
    Let's see how much it might cost to buy coffee every day during a week

  Background:
    Given coffee is an incredibly expensive luxury

  Scenario Outline: Buy expensive coffee every day of the week
    When I buy a <COFFEE TYPE> on <DAY>
    Then my running total should be <RUNNING TOTAL>

    Examples:
      | DAY       | COFFEE TYPE       | RUNNING TOTAL |
      | Monday    | Moca Frappachino  | $8.34         |
      | Tuesday   | Milky Coffeeola   | $25.34        |
      | Wednesday | Espresso-max      | $31.34        |
      | Thursday  | Sweet Dark Mixola | $43.34        |
      | Friday    | Demonic Jolt      | $50.00        |

  Scenario: Verify coffee price list
    * I look at the coffee price list
    But I should see the following prices:
      | Coffee Type       | Cost    |
      | Moca Frappachino  | $8.34   |
      | Milky Coffeeola   | $17.00  |
      | Espresso-max      | $6.00   |
      | Sweet Dark Mixola | $12.00  |
      | Demonic Jolt      | $6.66   |
      | Heavenly Blend    | $333.77 |

