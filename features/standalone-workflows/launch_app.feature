Feature: Launch Demo App Workflow
  As an automation tester
  I want to launch the standalone application
  So that I can validate it successfully opens the correct app

  @standalone @launch
  Scenario: Validate application launches to My Demo App
    Given I launch the application
    Then I should see the text "Products" on the screen

