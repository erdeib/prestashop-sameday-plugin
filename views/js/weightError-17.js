function showWeightError(){
    // Cascade through known notification containers:
    // Classic theme (PS1.7/8/9) uses #notifications .container;
    // Hummingbird (PS9.1) may use a different structure.
    var container = document.querySelector('#notifications .container')
        || document.querySelector('.notifications-container')
        || document.querySelector('[data-role="notifications"]');
    if (container) {
        container.innerHTML = '<div class="alert alert-danger">The products exceed the maximum allowed weight. Please contact vendor for tailored solution.</div>';
    }
    var btn = document.querySelector('button[name="confirmDeliveryOption"]');
    if (btn) { btn.disabled = true; }
}
function hideWeightError(){
    var container = document.querySelector('#notifications .container')
        || document.querySelector('.notifications-container')
        || document.querySelector('[data-role="notifications"]');
    if (container) { container.innerHTML = ''; }
    var btn = document.querySelector('button[name="confirmDeliveryOption"]');
    if (btn) { btn.disabled = false; }
}