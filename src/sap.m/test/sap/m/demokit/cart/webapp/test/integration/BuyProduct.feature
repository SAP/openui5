Feature: Buy a Product

  Background:
    Given I start my App

  Scenario: Buy it
    When on home: I press on "The Flat Screens category"
    When on the category: I press on "The first Product"
    When on the product: I add the displayed product to the cart
    When on the product: I toggle the cart
    Then on the category: I teardown my app

    Given I start my App with the hash "category/FS/product/HT-1254/cart" keeping local storage
    Then on the product: I should see the right product

    When on the cart: I press on the proceed button
    Then on checkout: I should see the wizard step contents step

    When on checkout: I press on the next step button
    Then on checkout: I should see the wizard step payment type step

    When on checkout: I press on the next step button
    When on checkout: I enter wrong credit card information
    Then on checkout: I should see the footer with the error button

    When on checkout: I press on the button in the footer
    Then on checkout: I should see the message Popover

    When on checkout: I press the close button
    When on checkout: I enter correct credit card information
    Then on checkout: I should see the step4 button

    When on checkout: I press on the next step button
    When on checkout: I enter invoice address
    Then on checkout: I should see the step5 button

    When on checkout: I press on the next step button
    Then on checkout: I should see the delivery type step

    When on checkout: I press on the next step button
    Then on checkout: I should see the order summary

    When on checkout: I press on the edit button backto list
    Then on checkout: I should see the wizard step contents step

    When on checkout: I press on the bank transfer button
    When on checkout: I press on the yes button
    Then on checkout: I should see the step3 button

    When on checkout: I press on the next step button
    Then on checkout: I should see the step4 button

    When on checkout: I press on the next step button
    Then on checkout: I should see the step5 button

    When on checkout: I press on the next step button
    Then on checkout: I should see the delivery type step

    When on checkout: I press on the next step button
    Then on checkout: I should see the order summary

    When on checkout: I press on the edit button back to payment type
    Then on checkout: I should see the wizard step contents step

    When on checkout: I press on the cash on delivery button
    When on checkout: I press on the yes button
    Then on checkout: I should see the step3 button

    When on checkout: I press on the next step button
    When on checkout: I enter correct cash on delivery info
    Then on checkout: I should see the step4 button

    When on checkout: I press on the next step button
    Then on checkout: I should see the step5 button

    When on checkout: I press on the next step button
    Then on checkout: I should see the delivery type step

    When on checkout: I press on the next step button
    Then on checkout: I should see the order summary

    When on checkout: I press on the edit button back to invoice address
    Then on checkout: I should see the wizard step contents step

    When on checkout: I press on different address checkbox
    When on checkout: I press on the yes button
    When on checkout: I press on the next step button
    Then on checkout: I should see the delivery address step

    When on checkout: I enter delivery address text
    Then on checkout: I should see the step6 button

    When on checkout: I press on the next step button
    Then on checkout: I should see the delivery address step

    When on checkout: I press on the next step button
    Then on checkout: I should see the order summary

    When on checkout: I press on the edit button back to delivery type
    Then on checkout: I should see the wizard step contents step

    When on checkout: I press on the express delivery button
    When on checkout: I press on the next step button
    Then on checkout: I should see the order summary
    Then on checkout: I should see express delivery

    When on checkout: I press on the submit button
    When on checkout: I press on the yes button
    Then on order completed: I should see the order completed page

    When on order completed: I press on the return to shop button
    Then on the welcome page: I should see the welcome page
    Then on the welcome page: I teardown my app