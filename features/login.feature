Feature: Login Flow
  As a user
  I want to be able to log in to the application
  So that I can access my account

  @regression @sanity
  Scenario: Successful login with valid credentials
    Given I launch the application
    When I am on the login screen
    And I enter my valid username and password
    And I tap on the login button
    Then I should be successfully logged in
    And I should see the home screen
