@wire-transfer
Feature: Wire Transfer — Maker/Checker Workflow
  As a GEMS user with the Maker role
  I want to initiate a domestic wire transfer
  So that it can be reviewed and approved by a Checker before funds are sent

  Background:
    Given the Maker is logged into GEMS
    And the Checker is logged into GEMS in a separate session

  @smoke @maker-checker
  Scenario: Maker initiates a wire transfer and Checker approves it
    When the Maker navigates to the Wire Transfer page
    And the Maker fills in the recipient account number "1234567890"
    And the Maker fills in the transfer amount "5000.00" CAD
    And the Maker adds the memo "Vendor payment - INV-2024-099"
    And the Maker submits the wire transfer for approval
    Then the wire transfer status should be "Pending Approval"
    When the Checker navigates to the Pending Approvals queue
    And the Checker opens the wire transfer for "1234567890"
    And the Checker approves the wire transfer
    Then the wire transfer status should be "Approved"
    And the Maker should see a confirmation notification

  @negative @maker-checker
  Scenario: Checker rejects a wire transfer with a reason
    When the Maker navigates to the Wire Transfer page
    And the Maker fills in the recipient account number "9876543210"
    And the Maker fills in the transfer amount "10000.00" CAD
    And the Maker submits the wire transfer for approval
    Then the wire transfer status should be "Pending Approval"
    When the Checker navigates to the Pending Approvals queue
    And the Checker opens the wire transfer for "9876543210"
    And the Checker rejects the wire transfer with reason "Insufficient documentation"
    Then the wire transfer status should be "Rejected"
    And the Maker should see a rejection notification with the reason "Insufficient documentation"

  @negative
  Scenario: Maker cannot approve their own wire transfer
    When the Maker navigates to the Wire Transfer page
    And the Maker fills in the recipient account number "1112223334"
    And the Maker fills in the transfer amount "200.00" CAD
    And the Maker submits the wire transfer for approval
    Then the Maker should not see an Approve button for this transfer
