/**
 * VY Prompt Master - Test Fixtures
 * Valid and invalid YAML samples for testing
 */

/** Minimal valid VY prompt specification */
export const VALID_MINIMAL = `---
identity: VY Test Agent
purpose: This is a test purpose for automated testing
context:
  platform: VY (Vercept) automation agent on macOS
  access_method: desktop
  auth_state: logged_in
  environment: macOS Sonoma
inputs:
  - name: test_input
    required: true
    description: A test input parameter
task:
  goal: Complete the automated test successfully
  steps:
    - step_id: step_001_test_action
      intent: Perform a test action for validation
      locate: The test button in the top-right corner
      confirm_target: Button is visible and enabled
      act: Click the test button
      verify_outcome: Button click produces expected result
      fallback_paths:
        - Use keyboard shortcut Command+T instead
      safety_gate: safe
constraints:
  - Do not modify any user data during testing
output_format:
  type: yaml
self_check:
  - Did the test action complete successfully?
`;

/** Valid VY prompt with all optional fields */
export const VALID_FULL = `---
identity: VY Safari Cookie Cleaner
purpose: Clear all cookies and website data from Safari browser via macOS UI automation
context:
  platform: VY (Vercept) automation agent on macOS
  access_method: desktop
  auth_state: user_logged_in_as_needed
  environment:
    os: macOS
    browser: Safari
    shell: zsh
inputs:
  - name: user_task_description
    required: true
    description: Clear all cookies from Safari browser
    example: "Open Safari settings and clear all website cookies/data."
task:
  goal: Clear all cookies and website data from Safari browser via macOS UI automation
  steps:
    - step_id: step_001_launch_safari
      intent: Launch Safari browser if not already running
      locate: Safari application icon in the macOS Dock or Applications folder
      confirm_target: Safari compass-like icon is visible
      act: Click the Safari icon in the Dock
      verify_outcome: Safari is the active foreground application
      fallback_paths:
        - Use open_application tool with Safari
        - Open Spotlight and type Safari
      safety_gate: safe
    - step_id: step_002_open_settings
      intent: Open Safari Settings window
      locate: Safari menu in the macOS menu bar
      confirm_target: Safari menu is visible at top of screen
      act: Press Command+Comma keyboard shortcut
      verify_outcome: Safari Settings window appears
      fallback_paths:
        - Click Safari menu then Settings
      safety_gate: safe
    - step_id: step_003_confirm_deletion
      intent: Confirm the deletion of all cookies
      locate: Remove All button in the Manage Website Data dialog
      confirm_target: Remove All button is visible and enabled
      act: Click Remove All button after user confirmation
      verify_outcome: Confirmation dialog appears
      fallback_paths:
        - Try clicking button twice if unresponsive
      safety_gate: irreversible_requires_confirmation
      user_confirmation_required: true
      confirmation_prompt: This will delete all Safari cookies. Continue?
constraints:
  - Before the irreversible Remove All action require explicit user confirmation
  - Do not close Safari entirely unless explicitly requested
  - Use Command key for shortcuts not Control
assumptions:
  - id: safari_installed
    statement: Safari browser is installed on the macOS system
    confidence: high
    risk: Safari may have been removed or is corrupted
    mitigation: First step verifies Safari can be launched
    verification_method: Safari application window appears
output_format:
  type: yaml
  structure: Task completion report with status and evidence
robustness_improvements:
  retries:
    - condition: UI element not found after initial attempt
      max_attempts: 2
      backoff: "250ms, then 500ms"
      recovery_action: Re-scan visible screen area
  rollbacks:
    - trigger: User cancels at confirmation step
      procedure: Click Cancel on any open dialogs
      reversibility_level: full_system_reversion
failure_playbooks:
  - name: settings_locked
    detection: Manage Website Data button is grayed out
    response:
      - Check if Safari is managed by enterprise MDM
      - Report to user that settings are restricted
self_check:
  - All required keys present in YAML structure
  - Every action step uses locate confirm_target act verify_outcome pattern
  - Irreversible deletion action is gated with confirmation
`;

/** Invalid - missing required fields */
export const INVALID_MISSING_FIELDS = `---
identity: Incomplete Agent
purpose: This purpose is fine
`;

/** Invalid - past tense in act */
export const INVALID_PAST_TENSE = `---
identity: VY Test Agent
purpose: This is a test purpose for testing
context:
  platform: macOS
  access_method: desktop
  auth_state: logged_in
  environment: macOS
inputs:
  - name: test
    required: true
    description: Test input
task:
  goal: Complete the test successfully
  steps:
    - step_id: step_001_test
      intent: Test step with past tense
      locate: Test button location
      confirm_target: Button visible
      act: Clicked the button  # INVALID - past tense
      verify_outcome: Button was clicked
      fallback_paths: []
      safety_gate: safe
constraints:
  - Test constraint
output_format:
  type: yaml
self_check:
  - Is this valid?
`;

/** Invalid - wrong safety gate for delete action */
export const INVALID_SAFETY_GATE = `---
identity: VY Test Agent
purpose: Delete files without proper safety gate
context:
  platform: macOS
  access_method: desktop
  auth_state: logged_in
  environment: macOS
inputs:
  - name: test
    required: true
    description: Test input
task:
  goal: Delete files from the system
  steps:
    - step_id: step_001_delete
      intent: Delete all files in folder
      locate: Delete button in the dialog
      confirm_target: Delete button is visible
      act: Click Delete All button  # Should have irreversible gate
      verify_outcome: Files are deleted
      fallback_paths:
        - Use keyboard delete shortcut
      safety_gate: safe  # INVALID - should be irreversible_requires_confirmation
constraints:
  - Handle file deletion
output_format:
  type: yaml
self_check:
  - Are safety gates correct?
`;

/** Invalid - control key instead of command */
export const INVALID_CONTROL_KEY = `---
identity: VY Test Agent
purpose: Test with wrong modifier key
context:
  platform: macOS
  access_method: desktop
  auth_state: logged_in
  environment: macOS
inputs:
  - name: test
    required: true
    description: Test input
task:
  goal: Complete the test successfully
  steps:
    - step_id: step_001_test
      intent: Use keyboard shortcut
      locate: Menu bar at top
      confirm_target: Menu visible
      act: Press Control+C to copy  # INVALID - should be Command
      verify_outcome: Content copied
      fallback_paths:
        - Use Edit menu
      safety_gate: safe
constraints:
  - Use correct shortcuts
output_format:
  type: yaml
self_check:
  - Are shortcuts correct?
`;
