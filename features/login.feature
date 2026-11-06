Feature: Login

  Scenario: Standard user can log in
    Given I am on the login page
    When I log in as "standard_user" with password "secret_sauce"
    Then I should be redirected to the inventory page

  Scenario: Locked out user sees an error message
    Given I am on the login page
    When I log in as "locked_out_user" with password "secret_sauce"
    Then I should see an error message containing "locked out"
