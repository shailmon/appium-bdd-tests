Feature: Error Handling
  As a user
  I want to see descriptive error messages
  So that I know what went wrong

  @regression
  Scenario: Failed login with invalid credentials
    Given I launch the application
    When I am on the login screen
    And I enter an invalid username or password
    And I tap on the login button
    Then I should see an error message "Invalid credentials provided"
    And I should remain on the login screen
