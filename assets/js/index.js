// State management
let formData = {
    amount: '',
    term: '',
    rate: '',
    type: ''
};

// DOM elements
const form = document.getElementById('mortgageForm');
const clearBtn = document.getElementById('clearBtn');
const emptyResults = document.getElementById('emptyResults');
const completedResults = document.getElementById('completedResults');
const monthlyAmount = document.getElementById('monthlyAmount');
const totalAmount = document.getElementById('totalAmount');

// Input formatting functions
function formatNumber(value) {
    // Remove all non-digits and decimals
    const cleanValue = value.replace(/[^\d.]/g, '');
    // Format with commas
    const parts = cleanValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function unformatNumber(value) {
    return value.replace(/,/g, '');
}

// Input handlers
function setupInputHandlers() {
    const inputs = document.querySelectorAll('.form-input');

    inputs.forEach(input => {
        const wrapper = input.closest('.input-wrapper');

        // Focus and blur events
        input.addEventListener('focus', () => {
            wrapper.classList.add('focused');
            clearError(input.id);
        });

        input.addEventListener('blur', () => {
            wrapper.classList.remove('focused');

            // Format amount input
            if (input.id === 'amount' && input.value) {
                input.value = formatNumber(input.value);
            }
        });

        // Input validation and formatting
        input.addEventListener('input', (e) => {
            let value = e.target.value;

            if (input.id === 'amount') {
                // Allow digits, commas, and one decimal point
                value = value.replace(/[^\d,.]*/g, '');
                // Prevent multiple decimal points
                const decimalCount = (value.match(/\./g) || []).length;
                if (decimalCount > 1) {
                    value = value.substring(0, value.lastIndexOf('.'));
                }
                e.target.value = value;
                formData.amount = unformatNumber(value);
            } else if (input.id === 'term') {
                // Only allow digits for term
                value = value.replace(/\D/g, '');
                e.target.value = value;
                formData.term = value;
            } else if (input.id === 'rate') {
                // Allow digits and one decimal point for rate
                value = value.replace(/[^\d.]/g, '');
                const decimalCount = (value.match(/\./g) || []).length;
                if (decimalCount > 1) {
                    value = value.substring(0, value.lastIndexOf('.'));
                }
                e.target.value = value;
                formData.rate = value;
            }

            clearError(input.id);
        });
    });
}

// Radio button handlers
function setupRadioHandlers() {
    const radioOptions = document.querySelectorAll('.radio-option');

    radioOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            radioOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            // Update form data
            formData.type = option.dataset.type;
            clearError('type');
        });
    });
}

// Error handling
function showError(fieldId, message = 'This field is required') {
    const wrapper = document.querySelector(`[data-input="${fieldId}"]`) ||
        document.querySelector('.radio-group').parentElement;
    const errorElement = document.getElementById(`${fieldId}Error`);

    if (wrapper) wrapper.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(fieldId) {
    const wrapper = document.querySelector(`[data-input="${fieldId}"]`) ||
        document.querySelector('.radio-group').parentElement;
    const errorElement = document.getElementById(`${fieldId}Error`);

    if (wrapper) wrapper.classList.remove('error');
    if (errorElement) errorElement.style.display = 'none';
}

// Form validation
function validateForm() {
    let isValid = true;

    // Clear all previous errors
    ['amount', 'term', 'rate', 'type'].forEach(clearError);

    // Validate amount
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
        showError('amount');
        isValid = false;
    }

    // Validate term
    if (!formData.term || parseInt(formData.term) <= 0) {
        showError('term');
        isValid = false;
    }

    // Validate rate
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
        showError('rate');
        isValid = false;
    }

    // Validate type
    if (!formData.type) {
        showError('type');
        isValid = false;
    }

    return isValid;
}

// Mortgage calculation
function calculateMortgage() {
    const principal = parseFloat(formData.amount);
    const annualRate = parseFloat(formData.rate) / 100;
    const monthlyRate = annualRate / 12;
    const numberOfPayments = parseInt(formData.term) * 12;

    if (formData.type === 'repayment') {
        // Standard repayment mortgage calculation
        if (monthlyRate === 0) {
            // Handle 0% interest rate case
            const monthlyPayment = principal / numberOfPayments;
            return {
                monthly: monthlyPayment,
                total: principal
            };
        }

        const monthlyPayment = principal *
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        const totalPayment = monthlyPayment * numberOfPayments;

        return {
            monthly: monthlyPayment,
            total: totalPayment
        };
    } else {
        // Interest-only mortgage calculation
        const monthlyPayment = principal * monthlyRate;
        const totalPayment = (monthlyPayment * numberOfPayments) + principal;

        return {
            monthly: monthlyPayment,
            total: totalPayment
        };
    }
}

// Display results
function displayResults(results) {
    monthlyAmount.textContent = `$${results.monthly.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    totalAmount.textContent = `$${results.total.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    emptyResults.style.display = 'none';
    completedResults.style.display = 'block';
}

// Clear form
function clearForm() {
    // Reset form data
    formData = { amount: '', term: '', rate: '', type: '' };

    // Clear inputs
    document.getElementById('amount').value = '';
    document.getElementById('term').value = '';
    document.getElementById('rate').value = '';

    // Clear radio selection
    document.querySelectorAll('.radio-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Clear errors
    ['amount', 'term', 'rate', 'type'].forEach(clearError);

    // Show empty results
    emptyResults.style.display = 'block';
    completedResults.style.display = 'none';
}

// Form submission
function handleSubmit(e) {
    e.preventDefault();

    if (validateForm()) {
        const results = calculateMortgage();
        displayResults(results);
    }
}

// Initialize event listeners
function init() {
    setupInputHandlers();
    setupRadioHandlers();

    form.addEventListener('submit', handleSubmit);
    clearBtn.addEventListener('click', clearForm);
}

// Start the application
init();