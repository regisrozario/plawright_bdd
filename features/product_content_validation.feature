Feature: Product content validation

  Background:
    Given I am on the "/mac/" product page

  @content-validation
  Scenario: Every Mac product tile has a name and a well-formed starting price
    Then every product should have a non-empty name and a well-formed starting price

  Scenario: The Mac lineup includes the core desktop products
    Then the product lineup should include "iMac"
    And the product lineup should include "Mac mini"
