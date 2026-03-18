Feature: MFA Flow
  As a secure user
  I want to verify my identity via a one-time password
  So that my account remains secure

  @regression
  Scenario: Successful MFA verification after login
    Given I launch the application
    When I log in with valid credentials that require MFA
    Then I should be prompted for an MFA code
    When I enter a valid 6-digit MFA code
    And I tap the verify button
    Then I should be successfully logged in
    And I should see the home screen
