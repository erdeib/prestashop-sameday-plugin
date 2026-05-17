<?php
/**
 * Upgrade script for SamedayCourier 1.9.0
 *
 * Adds PrestaShop 9 compatibility:
 * - No schema changes required.
 * - Re-registers the displayHeader hook using the version-aware name so that
 *   shops upgrading from 1.6 installs (which registered "Header") are updated.
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

function upgrade_module_1_9_0($object)
{
    // Ensure the correct header hook is registered for the current PS version.
    $hookName = (version_compare(_PS_VERSION_, '1.7.0.0') < 0)
        ? 'Header'
        : 'displayHeader';

    return $object->registerHook($hookName);
}
