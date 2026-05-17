# SamedayCourier – PrestaShop 9.x Compatibility Changelog

This document describes every change made to bring the plugin up to full
compatibility with **PrestaShop 9.0** and **PrestaShop 9.1**.

---

## Version 1.9.1 — PrestaShop 9.1 / Hummingbird theme

### Background

PrestaShop 9.1 ships with **Hummingbird** as the default theme for new
installations.  Hummingbird replaces Bootstrap 4 with **Bootstrap 5.3** and
marks **jQuery as deprecated** (still bundled in 9.1, but scheduled for
removal in a future major release).  Existing stores upgrading from 9.0 keep
the Classic theme and are unaffected by Bootstrap changes.

---

### `samedaycourier.php`

| Field | Old value | New value |
|-------|-----------|-----------|
| `$this->version` | `1.9.0` | `1.9.1` |

---

### `views/js/weightError-17.js`

**Problem:** Used jQuery (`$('#notifications .container').html(...)`) which is
deprecated in Hummingbird and may be unavailable in future PS releases.  Also,
Hummingbird's notification area uses a different HTML structure from the
Classic theme, so the single selector would silently fail to display the
weight-error banner.

**Fix:**
- Replaced all jQuery calls with vanilla JavaScript (`document.querySelector`,
  `.innerHTML`, `.disabled`).
- Added a **cascade of notification-container selectors** so the banner is
  found in both themes:
  1. `#notifications .container` — Classic theme (PS 1.7 / PS 8 / PS 9.0)
  2. `.notifications-container` — alternative Classic layout
  3. `[data-role="notifications"]` — Hummingbird fallback

```js
// Before (jQuery, single selector)
$('#notifications .container').html('<div class="alert alert-danger">…</div>');
$('button[name="confirmDeliveryOption"]').prop('disabled', true);

// After (vanilla JS, multi-selector cascade)
var container = document.querySelector('#notifications .container')
    || document.querySelector('.notifications-container')
    || document.querySelector('[data-role="notifications"]');
if (container) { container.innerHTML = '<div class="alert alert-danger">…</div>'; }
var btn = document.querySelector('button[name="confirmDeliveryOption"]');
if (btn) { btn.disabled = true; }
```

---

### `views/js/weightError.js`

Same changes as `weightError-17.js` above (this file is served on PS 1.6
installs). Updated to vanilla JS with the same multi-selector cascade
(selector priority reversed: `.notifications-container.container` first, then
the PS 1.7 selectors as fallbacks).

---

### `views/templates/front/_partials/checkout_lockers.tpl`

**Problem:** The `_storeLocker()` JavaScript function used jQuery's `$.ajax()`
to POST the selected locker back to the server.  With jQuery deprecated in
Hummingbird this call would fail once jQuery is removed.

**Fix:** Replaced `$.ajax()` with the native **`fetch()` API** using
`FormData` for the POST body.

```js
// Before
$.ajax({
    url: storeLockerRoute,
    method: 'POST',
    data: { action: 'store_locker', locker: locker, idCart: idCart },
});

// After
const formData = new FormData();
formData.append('action', 'store_locker');
formData.append('locker', locker);
formData.append('idCart', idCart);
fetch(storeLockerRoute, { method: 'POST', body: formData });
```

---

### `views/templates/front/checkout_lockers_selector.v17.tpl`

**Problem:** The locker `<select>` only had `class="form-control"`.  Bootstrap
5 (Hummingbird) expects `form-select` for `<select>` elements; `form-control`
alone produces unstyled output.

**Fix:** Added `form-select` alongside the existing class.  Bootstrap 4
(Classic) ignores the unknown class; Bootstrap 5 applies the correct styling.

```html
<!-- Before -->
<select … class="form-control" …>

<!-- After -->
<select … class="form-control form-select" …>
```

---

### `views/templates/front/checkout_open_package.v17.tpl`

**Problem:** The open-package checkbox was wrapped in a `<div class="form-control">`,
which is semantically incorrect (Bootstrap intended `form-control` for text
inputs).  In Bootstrap 5 this caused broken layout and the checkbox label was
not associated with the input.

**Fix:** Replaced with the proper Bootstrap 4 **and** Bootstrap 5 compatible
`form-check` structure, with a `<label>` linked via `for`/`id`.

```html
<!-- Before -->
<div class="col-sm-12">
    <div class="form-control">
        <input … type="checkbox" value="{$carrier_id}" /> {$label|…}
    </div>
</div>

<!-- After -->
<div class="col-sm-12">
    <div class="form-check">
        <input … type="checkbox" class="form-check-input" value="{$carrier_id}" />
        <label class="form-check-label" for="samedaycourier_open_package">
            {$label|…}
        </label>
    </div>
</div>
```

---

### `views/templates/front/checkout_lockers.v17.tpl`

**Problem:** The "Show locations" button used `class="btn btn-default"`.
Bootstrap 5 removed `btn-default`; Hummingbird would render a plain
unstyled button.

**Fix:** Added `btn-secondary` alongside `btn-default`.  Classic (BS4) keeps
its existing grey style via `btn-default`; Hummingbird (BS5) uses
`btn-secondary`.

```html
<!-- Before -->
class="button-exclusive btn btn-default"

<!-- After -->
class="button-exclusive btn btn-default btn-secondary"
```

---

### `views/templates/front/bgn_conversion_label.v17.tpl`

**Problem:** The BGN currency-conversion label was wrapped in
`<div class="form-control">`, making it look like a disabled text input
(incorrect semantics in both BS4 and BS5).

**Fix:** Replaced with a semantic `<p class="text-muted small mb-0">`.

```html
<!-- Before -->
<div class="form-control">
    {$currency_conversion_label|…}
</div>

<!-- After -->
<p class="text-muted small mb-0">
    {$currency_conversion_label|…}
</p>
```

---

### `upgrade/upgrade-1.9.1.php` *(new file)*

Added an upgrade script so the PrestaShop module manager marks the migration
as complete when upgrading from any earlier version.  No database changes are
required for this release.

---

---

## Version 1.9.0 — PrestaShop 9.0

### Background

PrestaShop 9.0 introduced several architectural changes relevant to this
module:

- **PHP 8.1** is the minimum supported PHP version.
- The **admin layout is now fully Symfony-driven**, changing the lifecycle of
  legacy `AdminController` methods.  In particular,
  `AdminController::$currentIndex` may be empty in contexts where
  `AdminController::init()` has not run (e.g., front-office requests, cron
  jobs that bootstrap the module).
- **Version numbers** jumped from `1.x` to `9.x`, breaking version-comparison
  guards that checked for `getMajorVersion() === 1`.

---

### `samedaycourier.php`

#### 1. Version bump

| Field | Old value | New value |
|-------|-----------|-----------|
| `$this->version` | `1.8.5` | `1.9.0` |

#### 2. `__construct()` — defensive `$currentIndex` assignment

**Problem:** The constructor assigned `$this->currentIndex` using a bare
concatenation of the static `AdminController::$currentIndex`.  In PS 9.0's
new Symfony-driven admin layout, `AdminController::$currentIndex` can be
`null` or an empty string depending on the execution context, producing broken
admin URLs.

**Fix:** Cache the static value and fall back to `Link::getAdminLink()` when
it is empty.

```php
// Before
$this->currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;

// After
$legacyIndex = AdminController::$currentIndex;
$this->currentIndex = (!empty($legacyIndex)
    ? $legacyIndex
    : $this->context->link->getAdminLink('AdminModules', false))
    . '&configure=' . $this->name;
```

#### 3. `insertNewHeader()` — version detection for weight-error JS

**Problem:** The method selected the appropriate weight-error JS file by
checking `getMajorVersion() === 1 && getMinorVersion() === 7`.  For PS 9.0
`getMajorVersion()` returns `9`, so the condition was `false` and the plugin
fell through to the PS 1.6-era `weightError.js` instead of the PS 1.7+
`weightError-17.js`.

**Fix:** Inverted the logic — use the modern file for every PS version *except*
PS 1.6.

```php
// Before – only PS 1.7 exactly got the modern file
if (($this->getMajorVersion() === 1) && ($this->getMinorVersion() === 7)) {
    $errorFile = 'views/js/weightError-17.js';
} else {
    $errorFile = 'views/js/weightError.js';   // PS 9 incorrectly landed here
}

// After – PS 1.7, PS 8, PS 9+ all get the modern file
if (($this->getMajorVersion() === 1) && ($this->getMinorVersion() === 6)) {
    $errorFile = 'views/js/weightError.js';        // PS 1.6 only
} else {
    $errorFile = 'views/js/weightError-17.js';     // PS 1.7, PS 8, PS 9+
}
```

---

### `upgrade/upgrade-1.9.0.php` *(new file)*

Added an upgrade script that re-registers the correct header hook name
(`displayHeader` for PS 1.7+ or `Header` for PS 1.6) for stores upgrading
from older installs.

---

## Hooks verified still present in PS 9.x

The following hooks used by this plugin were confirmed available in both
PS 9.0 and PS 9.1:

| Hook | Purpose |
|------|---------|
| `actionCarrierUpdate` | Sync carrier ID after PS carrier duplication |
| `displayAdminAfterHeader` | Show admin flash messages |
| `actionValidateOrder` | Save locker / open-package selection at order creation |
| `actionCarrierProcess` | Carrier processing (placeholder) |
| `actionValidateStepComplete` | Validate locker is selected before checkout completes |
| `displayAdminOrderSide` | Render AWB panel on the order detail page |
| `displayCarrierExtraContent` | Render locker / open-package selector in checkout |
| `displayHeader` | Inject JS assets on checkout pages |

---

## Compatibility matrix

| Plugin version | PS 1.6 | PS 1.7 | PS 8.x | PS 9.0 | PS 9.1 |
|----------------|:------:|:------:|:------:|:------:|:------:|
| ≤ 1.8.5 | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| 1.9.0 | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **1.9.1** | ✅ | ✅ | ✅ | ✅ | ✅ |

> ⚠️ = functional but with minor visual issues (unstyled elements or missing
> weight-error banners on some themes).
