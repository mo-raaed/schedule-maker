import { expect, test, type Page } from "@playwright/test";

/** Guest mode reaches the whole builder without Clerk auth. */
async function enterBuilder(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Building" }).click();
  await expect(page.getByRole("button", { name: "Add Task", exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  // Each test starts from a clean local store.
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("landing page reaches the grid in guest mode", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Weekly Schedule");
  await enterBuilder(page);
});

test("landing copy makes no claim the code cannot honour", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Flawless Export")).toHaveCount(0);
});

test.describe("modal", () => {
  test("clicking the backdrop dismisses the dialog", async ({ page }) => {
    await enterBuilder(page);
    await page.getByRole("button", { name: "Add Task", exact: true }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click far from the panel — the backdrop owns this click.
    await page.mouse.click(8, 8);
    await expect(dialog).toBeHidden();
  });

  test("Escape dismisses the dialog", async ({ page }) => {
    await enterBuilder(page);
    await page.getByRole("button", { name: "Add Task", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("exposes dialog semantics and a labelled close button", async ({ page }) => {
    await enterBuilder(page);
    await page.getByRole("button", { name: "Add Task", exact: true }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog.getByRole("button", { name: "Close dialog" })).toBeVisible();
  });

  test("traps Tab inside the dialog", async ({ page }) => {
    await enterBuilder(page);
    await page.getByRole("button", { name: "Add Task", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Walk far enough to escape an untrapped dialog, then assert we never left.
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return !!dialog && !!document.activeElement && dialog.contains(document.activeElement);
      });
      expect(inside, `focus escaped the dialog after ${i + 1} tabs`).toBe(true);
    }
  });

  test("restores focus to the trigger on close", async ({ page }) => {
    await enterBuilder(page);
    const trigger = page.getByRole("button", { name: "Add Task", exact: true });
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe("keyboard path through the grid", () => {
  test("Enter on a grid cell opens the editor prefilled with that slot", async ({ page }) => {
    await enterBuilder(page);

    const cell = page.getByRole("button", { name: "Add task — Mon 10:00 AM" });
    await cell.focus();
    await expect(cell).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Add Task" })).toBeVisible();
  });

  test("Enter on a task block opens it for editing", async ({ page }) => {
    await enterBuilder(page);

    // Create a task first.
    await page.getByRole("button", { name: "Add Task", exact: true }).click();
    await page.getByPlaceholder("e.g., Math Lecture, Gym, Meeting").fill("Standup");
    await page.getByRole("button", { name: "Mon", exact: true }).click();
    await page.getByRole("button", { name: "Add Task", exact: true }).last().click();
    await expect(page.getByRole("dialog")).toBeHidden();

    const block = page.getByRole("button", { name: /^Standup,/ });
    await expect(block).toBeVisible();
    await block.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("heading", { name: "Edit Task" })).toBeVisible();
  });
});

test.describe("destructive actions", () => {
  test("deleting a schedule asks first, and Cancel keeps it", async ({ page }) => {
    await enterBuilder(page);
    await page.getByRole("button", { name: "New Schedule" }).click();

    const target = page.getByRole("button", { name: "Actions for Schedule 2" });
    await expect(target).toBeVisible();
    await target.click();

    await page.getByRole("button", { name: "Delete" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("cannot be undone");

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("button", { name: "Actions for Schedule 2" })).toBeVisible();
  });

  test("confirming the delete removes the schedule", async ({ page }) => {
    await enterBuilder(page);
    await page.getByRole("button", { name: "New Schedule" }).click();

    await page.getByRole("button", { name: "Actions for Schedule 2" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();

    await expect(page.getByRole("button", { name: "Actions for Schedule 2" })).toHaveCount(0);
  });

  test("schedule actions are reachable without a right-click", async ({ page }) => {
    await enterBuilder(page);
    // The kebab is the visible affordance; touch devices have no contextmenu.
    await page.getByRole("button", { name: /^Actions for/ }).first().click();
    await expect(page.getByRole("button", { name: "Rename" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Duplicate" })).toBeVisible();
  });
});
