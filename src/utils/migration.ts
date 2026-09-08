/**
 * One-time localStorage key migration utility.
 * Migrates legacy `buildora_*` keys to `constrora_*` keys and cleans up obsolete items.
 */
export function migrateLocalStorageKeys(): void {
  if (typeof window === 'undefined') return;

  const legacyMappings: Record<string, string> = {
    'buildora_listings_v3': 'constrora_listings_v1',
    'buildora_listings_v2': 'constrora_listings_v1',
    'constrora_listings_v3': 'constrora_listings_v1',
    'buildora_quote_requests_v2': 'constrora_quote_requests_v1',
    'constrora_quote_requests_v3': 'constrora_quote_requests_v1',
    'buildora_businesses_v3': 'constrora_businesses_v1',
    'buildora_businesses_v2': 'constrora_businesses_v1',
    'buildora_user_session': 'constrora_user_session',
    'buildora_temp_role': 'constrora_temp_role',
    'buildora_supplier_onboarding_step': 'constrora_supplier_onboarding_step',
    'buildora_supplier_onboarding_completed': 'constrora_supplier_onboarding_completed',
    'buildora_client_onboarding_completed': 'constrora_client_onboarding_completed',
    'buildora_onboarding_done': 'constrora_onboarding_done',
    'buildora_theme': 'constrora_theme',
    'buildora_user_projects': 'constrora_user_projects',
    'buildora_active_project_id': 'constrora_active_project_id',
    'buildora_saved_items': 'constrora_saved_items',
    'buildora_sup_name': 'constrora_sup_name',
    'buildora_sup_type': 'constrora_sup_type',
    'buildora_sup_cats': 'constrora_sup_cats',
    'buildora_sup_catalog_ids': 'constrora_sup_catalog_ids',
  };

  try {
    for (const [legacyKey, newKey] of Object.entries(legacyMappings)) {
      const legacyVal = localStorage.getItem(legacyKey);
      if (legacyVal !== null) {
        if (localStorage.getItem(newKey) === null) {
          localStorage.setItem(newKey, legacyVal);
        }
        localStorage.removeItem(legacyKey);
      }
    }
  } catch (e) {
    console.error('Error migrating localStorage keys:', e);
  }
}
