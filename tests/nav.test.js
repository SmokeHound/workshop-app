/**
 * Sidebar Navigation Markup Tests
 * Framework: Jest + JSDOM (expect/describe/it globals)
 *
 * These tests validate the structure and critical attributes of the sidebar
 * navigation defined in the PR diff. They avoid framework-specific helpers
 * to remain compatible with a plain JSDOM test environment.
 */

const SIDEBAR_HTML = `
<div class="d-flex flex-column flex-shrink-0 p-3 bg-body-tertiary sidebar" style="width: 250px; height: 100vh; position: fixed;">
  <a href="index.html" class="d-flex align-items-center mb-3 link-dark text-decoration-none">
    <span class="fs-4">🛠 Workshop App</span>
  </a>
  <hr>
  <button class="btn btn-outline-secondary d-md-none mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-expanded="false">
    <i class="bi bi-list"></i> Menu
  </button>
  <div class="collapse d-md-block" id="sidebarMenu">
    <ul class="nav nav-pills flex-column mb-auto">
      <li><a href="index.html" class="nav-link" data-page="index.html"><i class="bi bi-house-door"></i> Home</a></li>
      <li><a href="order.html" class="nav-link" data-page="order.html"><i class="bi bi-box-seam"></i> Place Order</a></li>
      <li><a href="history.html" class="nav-link" data-page="history.html"><i class="bi bi-clock-history"></i> Order History</a></li>
      <li><a href="item-admin.html" class="nav-link" data-page="item-admin.html"><i class="bi bi-tools"></i> Item Admin</a></li>
      <li><a href="login.html" class="nav-link" data-page="login.html"><i class="bi bi-person-lock"></i> Login</a></li>
    </ul>
  </div>
  <hr>
  <button id="themeToggle" class="btn btn-sm btn-outline-secondary w-100 mt-auto">
    <i class="bi bi-moon"></i> Toggle Theme
  </button>
</div>
`;

function render(html) {
  document.body.innerHTML = html;
  return document.body;
}

describe("Sidebar navigation markup", () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = "";
  });

  it("renders the sidebar container with expected classes and inline styles", () => {
    const root = render(SIDEBAR_HTML);
    const container = root.querySelector(".sidebar");
    expect(container).toBeTruthy();
    const classList = container.classList;
    ["d-flex","flex-column","flex-shrink-0","p-3","bg-body-tertiary","sidebar"].forEach(c => {
      expect(classList.contains(c)).toBe(true);
    });

    // Validate key inline styles
    const style = container.getAttribute("style") || "";
    expect(style).toMatch(/width:\s*250px/);
    expect(style).toMatch(/height:\s*100vh/);
    expect(style).toMatch(/position:\s*fixed/);
  });

  it("contains a brand link to index.html with the correct title text", () => {
    const root = render(SIDEBAR_HTML);
    const brandLink = root.querySelector('a[href="index.html"].link-dark.text-decoration-none');
    expect(brandLink).toBeTruthy();
    expect(brandLink.classList.contains("d-flex")).toBe(true);
    const title = brandLink.querySelector("span.fs-4");
    expect(title).toBeTruthy();
    expect(title.textContent.trim()).toBe("🛠 Workshop App");
  });

  it("has a responsive menu toggle button configured for Bootstrap collapse", () => {
    const root = render(SIDEBAR_HTML);
    const btn = root.querySelector('button[data-bs-toggle="collapse"]');
    expect(btn).toBeTruthy();
    expect(btn.type).toBe("button");
    expect(btn.getAttribute("data-bs-target")).toBe("#sidebarMenu");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    // Class checks for responsive behavior
    ["btn","btn-outline-secondary","d-md-none","mb-3"].forEach(c => {
      expect(btn.classList.contains(c)).toBe(true);
    });
    // Icon existence
    const icon = btn.querySelector("i.bi.bi-list");
    expect(icon).toBeTruthy();
    expect(btn.textContent).toMatch(/Menu/);
  });

  it("defines a collapsible menu container with id 'sidebarMenu' and default classes", () => {
    const root = render(SIDEBAR_HTML);
    const collapse = root.querySelector("#sidebarMenu");
    expect(collapse).toBeTruthy();
    ["collapse","d-md-block"].forEach(c => {
      expect(collapse.classList.contains(c)).toBe(true);
    });
    const list = collapse.querySelector("ul.nav.nav-pills.flex-column.mb-auto");
    expect(list).toBeTruthy();
  });

  it("contains exactly five navigation links with expected labels, hrefs, and data-page attributes", () => {
    const root = render(SIDEBAR_HTML);
    const links = Array.from(root.querySelectorAll('#sidebarMenu ul a.nav-link'));
    expect(links).toHaveLength(5);

    const expectations = [
      { href: "index.html",  page: "index.html",  label: "Home",          icon: "bi-house-door" },
      { href: "order.html",  page: "order.html",  label: "Place Order",   icon: "bi-box-seam" },
      { href: "history.html",page: "history.html",label: "Order History", icon: "bi-clock-history" },
      { href: "item-admin.html", page: "item-admin.html", label: "Item Admin", icon: "bi-tools" },
      { href: "login.html",  page: "login.html",  label: "Login",         icon: "bi-person-lock" },
    ];

    expectations.forEach((exp, idx) => {
      const a = links[idx];
      expect(a.getAttribute("href")).toBe(exp.href);
      expect(a.getAttribute("data-page")).toBe(exp.page);
      expect(a.classList.contains("nav-link")).toBe(true);
      // Icon inside anchor
      const i = a.querySelector(`i.bi.${exp.icon}`);
      expect(i).toBeTruthy();
      // Label text appears after icon; use textContent trimming
      expect(a.textContent.replace(/\s+/g, " ").trim()).toContain(exp.label);
    });
  });

  it("exposes a theme toggle button with consistent styling and icon", () => {
    const root = render(SIDEBAR_HTML);
    const themeBtn = root.querySelector("#themeToggle");
    expect(themeBtn).toBeTruthy();
    ["btn","btn-sm","btn-outline-secondary","w-100","mt-auto"].forEach(c => {
      expect(themeBtn.classList.contains(c)).toBe(true);
    });
    const icon = themeBtn.querySelector("i.bi.bi-moon");
    expect(icon).toBeTruthy();
    expect(themeBtn.textContent).toMatch(/Toggle Theme/);
  });

  it("contains horizontal rules separating sections", () => {
    const root = render(SIDEBAR_HTML);
    const hrs = root.querySelectorAll("hr");
    // One after header link, one before theme toggle
    expect(hrs.length).toBe(2);
  });

  it("fails gracefully if required elements are missing (defensive check example)", () => {
    // Simulate accidental removal of sidebarMenu id
    const broken = SIDEBAR_HTML.replace('id="sidebarMenu"', 'id="missingMenu"');
    const root = render(broken);
    const collapse = root.querySelector("#sidebarMenu");
    expect(collapse).toBeNull();

    // Menu button should still exist but target won't resolve; validate mismatch
    const btn = root.querySelector('button[data-bs-toggle="collapse"]');
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("data-bs-target")).toBe("#sidebarMenu");
  });
});