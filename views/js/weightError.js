function showWeightError(){
    var container = document.querySelector('.notifications-container.container')
        || document.querySelector('#notifications .container')
        || document.querySelector('[data-role="notifications"]');
    if (container) {
        container.innerHTML = '<div class="alert alert-danger">The products exceed the maximum allowed weight. Please contact vendor for tailored solution.</div>';
    }
    var btn = document.querySelector('button[name="confirmDeliveryOption"]');
    if (btn) { btn.disabled = true; }
}
function hideWeightError(){
    var container = document.querySelector('.notifications-container.container')
        || document.querySelector('#notifications .container')
        || document.querySelector('[data-role="notifications"]');
    if (container) { container.innerHTML = ''; }
    var btn = document.querySelector('button[name="confirmDeliveryOption"]');
    if (btn) { btn.disabled = false; }
}