<?php
/**
 * Upgrade script for SamedayCourier 1.9.1
 *
 * Adds PrestaShop 9.1 / Hummingbird theme compatibility:
 * - No database schema changes required.
 * - Front-end templates updated for Bootstrap 5 (Hummingbird) while remaining
 *   backward compatible with Bootstrap 4 (Classic theme).
 * - Notification JS scripts migrated from jQuery to vanilla JS.
 * - jQuery $.ajax replaced with fetch() API in locker partial.
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

function upgrade_module_1_9_1($object)
{
    // Nothing to migrate at DB/hook level; return true to mark upgrade as successful.
    return true;
}
