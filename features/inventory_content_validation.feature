Feature: Inventory content validation

  Background:
    Given I am logged in as "standard_user"

  @content-validation
  Scenario: Every product has a well-formed name and price
    Then every product should have a non-empty name and a well-formed price

  Scenario: Adding a product updates the cart badge
    When I add "Sauce Labs Backpack" to the cart
    Then the cart badge should show "1"
