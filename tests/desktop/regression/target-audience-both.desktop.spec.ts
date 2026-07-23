import { expect, test } from "../../../fixtures/base.fixture";
import { GhostTarget, TargetAudiencePage } from "../../../pages/target-audience.page";

const qaUserEmail = process.env.QA_USER_EMAIL ?? "";
const qaUserPassword = process.env.QA_USER_PASSWORD ?? "";
const qaMfaCode = process.env.QA_MFA_CODE ?? "";

test.describe("Target audience lifecycle @desktop @regression @feature-target-audience", () => {
  test("QA user can add, edit, duplicate, and archive a Both audience", async ({ page }) => {
    const audiencePage = new TargetAudiencePage(page);
    const defaultAudienceName = "automation ";
    const editedAudienceName = "automation edit";

    const giClick = async (
      sequence: number,
      target: GhostTarget,
      description: string,
      options?: { optional?: boolean; preferred?: any },
    ): Promise<void> => {
      await test.step(`GI #${sequence} click - ${description}`, async () => {
        await audiencePage.click(target, {
          optional: options?.optional,
          preferred: options?.preferred,
          stepLabel: `GI #${sequence}`,
        });
      });
    };

    const giFill = async (
      sequence: number,
      target: GhostTarget,
      value: string,
      description: string,
      options?: { optional?: boolean; preferred?: any },
    ): Promise<void> => {
      await test.step(`GI #${sequence} assign - ${description}`, async () => {
        await audiencePage.fill(target, value, {
          optional: options?.optional,
          preferred: options?.preferred,
          stepLabel: `GI #${sequence}`,
        });
      });
    };

    const giAssertText = async (sequence: number, target: GhostTarget, expectedText: string, description: string): Promise<void> => {
      await test.step(`GI #${sequence} assertTextPresent - ${description}`, async () => {
        await audiencePage.assertTextPresent(target, expectedText, { stepLabel: `GI #${sequence}` });
      });
    };

    const giAssertPresent = async (
      sequence: number,
      target: GhostTarget,
      description: string,
      options?: { optional?: boolean; preferred?: any },
    ): Promise<void> => {
      await test.step(`GI #${sequence} assertElementPresent - ${description}`, async () => {
        await audiencePage.assertElementPresent(target, {
          optional: options?.optional,
          preferred: options?.preferred,
          stepLabel: `GI #${sequence}`,
        });
      });
    };

    const giToggleHideArchived = async (sequence: number, description: string, optional: boolean = false): Promise<void> => {
      await test.step(`GI #${sequence} click - ${description}`, async () => {
        const clicked = await audiencePage.click(".react-switch-bg", {
          optional: true,
          preferred: [
            page.getByRole("switch", { name: /hide archived/i }),
            page.getByLabel(/hide archived/i),
            page.locator('label:has-text("Hide Archived") .react-switch-bg'),
            page.locator("label").filter({ hasText: /hide archived/i }).locator(".react-switch-bg"),
            page.locator(".react-switch-bg"),
          ],
          stepLabel: `GI #${sequence}`,
        });

        if (!clicked && !optional) {
          const hasHideArchivedLabel = await page.getByText(/hide archived/i).first().isVisible().catch(() => false);
          if (!hasHideArchivedLabel) {
            throw new Error("Hide Archived toggle/label was not found in this UI variant.");
          }
        }
      });
    };

    await test.step("GI #0 open - Navigate to login URL", async () => {
      await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 90_000 });
      await expect(page).toHaveURL(/login|signin|auth/i);
    });

    await test.step("GI #1 store - Capture AdminEmail variable from environment", async () => {
      await expect(qaUserEmail, "Set QA_USER_EMAIL in .env before running").not.toEqual("");
    });

    await giFill(2, 'input[type="email"]', qaUserEmail, "Enter admin email", {
      optional: true,
      preferred: [
        page.getByLabel(/email|username/i),
        page.getByPlaceholder(/email|username/i),
      ],
    });

    await giFill(3, 'input[type="password"]', qaUserPassword, "Enter password (private field)", {
      preferred: [
        page.getByLabel(/password/i),
        page.getByPlaceholder(/password/i),
      ],
    });

    await giClick(4, 'button[type="submit"]', "Submit login form", {
      optional: true,
      preferred: page.getByRole("button", { name: /sign in|log in|login|send code/i }),
    });

    await test.step("GI #5 pause - Wait 30000ms for post-login and MFA flow", async () => {
      await audiencePage.pause(30_000);
    });

    await test.step("GI #6 eval - Open Ghost Inspector email window (not replicated in Playwright)", async () => {
      // In Playwright migration, MFA should come from QA_MFA_CODE in environment.
      // The GI hosted email inbox flow is intentionally replaced by env-driven MFA.
    });

    await test.step("GI #7 extract - Read MFA code from environment variable", async () => {
      // Optional in GI. If MFA is not shown this stays unused.
    });

    await test.step("GI #8 eval - Close temporary MFA window (no-op in Playwright)", async () => {
      // No extra browser window is opened in this migration flow.
    });

    await giAssertPresent(9, 'input[type="text"]', "Verify MFA input appears when required", {
      optional: true,
      preferred: [
        page.getByLabel(/code|verification|mfa/i),
        page.getByPlaceholder(/code|verification|mfa/i),
      ],
    });

    await test.step("GI #10 assign - Fill MFA code when MFA input exists", async () => {
      const filled = await audiencePage.fill('input[type="text"]', qaMfaCode, {
        optional: true,
        preferred: [
          page.getByLabel(/code|verification|mfa/i),
          page.getByPlaceholder(/code|verification|mfa/i),
          page.locator('input[name*="code" i], input[name*="mfa" i]').first(),
        ],
        stepLabel: "GI #10",
      });
      if (filled) {
        await expect(qaMfaCode, "Set QA_MFA_CODE in .env when MFA is required").not.toEqual("");
      }
    });

    await giClick(11, 'button[type="submit"]', "Submit MFA form when present", {
      optional: true,
      preferred: page.getByRole("button", { name: /verify|continue|submit|sign in/i }),
    });

    await test.step("GI #12 click - Open Audiences section", async () => {
      const openedByNavClick = await audiencePage.click(
        [
          { selector: '//a[contains(text(), "Audiences")]' },
          { selector: "li.User.Management:nth-of-type(9) > a" },
        ],
        {
          optional: true,
          preferred: [
            page.getByRole("link", { name: /audiences/i }),
            page.getByRole("link", { name: /target audience/i }),
          ],
          stepLabel: "GI #12",
        },
      );

      if (!openedByNavClick) {
        // Some builds do not expose the same sidebar item structure as GI.
        // Fallback to direct route while preserving the same business intent.
        await page.goto("/main/plugin/target-audience/default/", {
          waitUntil: "domcontentloaded",
          timeout: 90_000,
        });
      }

      await expect(page).toHaveURL(/audience|target-audience/i);
    });

    await giToggleHideArchived(13, "Toggle Hide Archived switch");

    await giClick(
      14,
      [
        { selector: '//button[contains(text(), "+ Add Audience")]' },
        { selector: 'button[type="button"].btn.btn-primary' },
      ],
      "Open add audience form",
      {
        preferred: page.getByRole("button", { name: /\+?\s*add audience/i }),
      },
    );

    await giClick(15, 'input[name="name"]', "Focus audience name input", {
      preferred: page.getByLabel(/name/i),
    });
    await giFill(16, 'input[name="name"]', defaultAudienceName, 'Set audience name to "automation "', {
      preferred: page.getByLabel(/name/i),
    });

    await giClick(17, "div.form-group:nth-of-type(2) > label", "Open second form group label");

    await giClick(
      18,
      [
        { selector: '//span[contains(text(), "Select")]' },
        { selector: ".link-button" },
      ],
      "Open select dialog for audience rules",
    );

    await giClick(19, ".form-inline > button.btn.btn-success:nth-of-type(1)", "Add first rule group");
    await giClick(
      20,
      ".condition > div > div:nth-of-type(1) > div > div:nth-of-type(1) > div:nth-of-type(2)",
      "Open first condition dropdown",
    );
    await giClick(21, "#react-select-3-option-4", "Choose dropdown option index 4");

    await giClick(
      22,
      [
        { selector: '//button[contains(text(), "Set Audience")]' },
        { selector: 'button[type="button"].btn.btn--outline-primary' },
      ],
      "Apply audience rules",
      {
        preferred: page.getByRole("button", { name: /set audience/i }),
      },
    );

    await giClick(
      23,
      [
        { selector: '//button[contains(text(), "Save Changes")]' },
        { selector: 'button[type="button"].btn.btn-primary' },
      ],
      "Save audience creation changes",
      {
        preferred: page.getByRole("button", { name: /save changes/i }),
      },
    );

    await giToggleHideArchived(24, "Re-toggle Hide Archived switch");
    await test.step("GI #25 pause - Wait 3000ms for table refresh", async () => {
      await audiencePage.pause(3_000);
    });

    await giClick(
      26,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[3]/div/table/tbody/tr/td[5]/div/div[1]',
      "Open row action menu",
    );
    await giClick(27, ".action-menu > button[type=\"button\"].btn.btn-primary:nth-of-type(3)", "Start publish action from menu");

    await giAssertText(28, ".modal-title", "Publish", "Verify first publish modal title");
    await giAssertText(
      29,
      ".modal-message",
      "There are no changes since last publish. Proceed anyway?",
      "Verify first publish modal message",
    );
    await giAssertText(30, ".modal-footer > button[type=\"button\"].btn.btn-primary", "Confirm", "Verify first publish confirm button");

    await giClick(
      31,
      [
        { selector: '//button[contains(text(), "Confirm")]' },
        { selector: '.modal-footer > button[type="button"].btn.btn-primary' },
      ],
      "Confirm first publish prompt",
      {
        preferred: page.getByRole("button", { name: /^confirm$/i }),
      },
    );

    await giAssertText(32, ".modal-title", "Publish TargetAudience", "Verify second publish modal title");
    await giAssertText(
      33,
      ".modal-message",
      "Are you sure you want to publish this TargetAudience? It will be automatically pushed to users next time they visit the app.",
      "Verify second publish modal message",
    );
    await giAssertText(34, ".modal-footer > button[type=\"button\"].btn.btn-primary", "Confirm", "Verify second publish confirm button");

    await giClick(
      35,
      [
        { selector: '//button[contains(text(), "Confirm")]' },
        { selector: '.modal-footer > button[type="button"].btn.btn-primary' },
      ],
      "Confirm second publish prompt",
      {
        preferred: page.getByRole("button", { name: /^confirm$/i }),
      },
    );

    await giClick(
      36,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[3]/div/table/tbody/tr/td[5]/div/div[2]/button[1]',
      "Open edit action for current audience",
    );
    await giClick(37, 'input[name="name"]', "Focus audience name for edit", {
      preferred: page.getByLabel(/name/i),
    });
    await giFill(38, 'input[name="name"]', editedAudienceName, 'Rename audience to "automation edit"', {
      preferred: page.getByLabel(/name/i),
    });

    await giClick(
      39,
      [
        { selector: '//button[contains(text(), "Save Changes")]' },
        { selector: 'button[type="button"].btn.btn-primary' },
      ],
      "Save edited audience",
      {
        preferred: page.getByRole("button", { name: /save changes/i }),
      },
    );

    await giToggleHideArchived(40, "Optional switch toggle", true);
    await test.step("GI #41 pause - Wait 3500ms for UI update", async () => {
      await audiencePage.pause(3_500);
    });

    await giClick(
      42,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[3]/div/table/tbody/tr/td[5]/div/div[1]',
      "Open row action menu after edit",
    );
    await giClick(43, ".action-menu > button[type=\"button\"].btn.btn-primary:nth-of-type(3)", "Publish edited audience");

    await giClick(
      44,
      [
        { selector: '//button[contains(text(), "Confirm")]' },
        { selector: '.modal-footer > button[type="button"].btn.btn-primary' },
      ],
      "Confirm no-change publish prompt",
      {
        preferred: page.getByRole("button", { name: /^confirm$/i }),
      },
    );
    await giAssertText(45, ".modal-title", "Publish TargetAudience", "Verify publish title after edit");
    await giAssertText(
      46,
      ".modal-message",
      "Are you sure you want to publish this TargetAudience? It will be automatically pushed to users next time they visit the app.",
      "Verify publish message after edit",
    );
    await giAssertText(47, ".modal-footer > button[type=\"button\"].btn.btn-primary", "Confirm", "Verify confirm button after edit");

    await giClick(
      48,
      [
        { selector: '//button[contains(text(), "Confirm")]' },
        { selector: '.modal-footer > button[type="button"].btn.btn-primary' },
      ],
      "Confirm final publish for edited audience",
      {
        preferred: page.getByRole("button", { name: /^confirm$/i }),
      },
    );

    await giAssertPresent(49, "h1.page-title", "Verify page title element is present");
    await giAssertText(
      50,
      ".section-toolbar > .action-buttons > div:nth-of-type(2) > button[type=\"button\"].btn.btn-primary",
      "+ Add Audience",
      "Verify add audience button text",
    );
    await giAssertText(51, "label > div > span", "Hide Archived", "Verify hide archived label text");

    await giClick(
      52,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[3]/div/table/tbody/tr/td[5]/div/div[1]',
      "Open row actions before duplicate/archive validation",
    );
    await giClick(53, ".action-menu > button[type=\"button\"].btn.btn-primary:nth-of-type(4)", "Select action menu item #4");
    await giClick(
      54,
      [
        { selector: '//button[contains(text(), "Cancel")]' },
        { selector: 'button[type="button"].btn.btn-default' },
      ],
      "Cancel archive confirmation dialog",
      {
        preferred: page.getByRole("button", { name: /^cancel$/i }),
      },
    );

    await giClick(
      55,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[1]/div/div[2]/div[1]/div/div/div[1]',
      "Click first filter/dropdown control before cleanup",
    );

    await giClick(
      56,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[3]/div/table/tbody/tr[2]/td[5]/div/div[1]',
      "Open second row action menu",
    );
    await giClick(
      57,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[3]/div/table/tbody/tr[2]/td[5]/div/div[2]/button[3]',
      "Trigger archive action on second row",
    );
    await giClick(
      58,
      [
        { selector: '//button[contains(text(), "Confirm")]' },
        { selector: '.modal-footer > button[type="button"].btn.btn-primary' },
      ],
      "Confirm archive for second row",
      {
        preferred: page.getByRole("button", { name: /^confirm$/i }),
      },
    );

    await giClick(
      59,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[3]/div/table/tbody/tr[1]/td[5]/div/div[1]',
      "Open first row action menu",
    );
    await giClick(
      60,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[3]/div/table/tbody/tr[1]/td[5]/div/div[2]/button[2]',
      "Trigger duplicate/archive-related action on first row",
    );
    await giClick(61, "body > div.modal.show > div > div > div.modal-footer > button.btn.btn-primary", "Confirm first row modal action");

    await giClick(
      62,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[3]/div/table/tbody/tr/td[5]/div/div[1]',
      "Open remaining row action menu",
    );
    await giClick(
      63,
      '//*[@id="page-content-wrapper"]/div/div/div/div/target-audience-list-page/div[3]/div/div/div[3]/div/table/tbody/tr/td[5]/div/div[2]/button[2]',
      "Trigger final cleanup action",
    );
    await giClick(64, "body > div.modal.show > div > div > div.modal-footer > button.btn.btn-primary", "Confirm final cleanup action");

    await giAssertText(
      65,
      "td.table-message",
      "There are no items that match your criteria.",
      "Verify empty-state table message after archive flow",
    );
  });
});
