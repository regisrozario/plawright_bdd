Feature: Mocking network requests

  Scenario: page.route mocks an API response without touching a real backend
    Given a page that fetches the price from "/api/price"
    When the "/api/price" endpoint is mocked to return a price of 42.5
    Then the page should display the price "$42.50"
