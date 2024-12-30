// Invoice Script
const accountNumberInput = document.getElementById('accountNumber');
const ifscCodeInput = document.getElementById('ifscCode');
const pageNoInput = document.getElementById('pageNo');
const dateInput = document.getElementById('currentDateTime');
const addItemBtn = document.getElementById('addItemBtn');
const saveBtn = document.getElementById('saveBtn');
const shareBtn = document.getElementById('shareBtn');
const itemTable = document.getElementById('itemtable');

// Initialize page number and date
let pageNo = parseInt(localStorage.getItem('lastPageNo')) || 100;
pageNoInput.value = pageNo;

// Set today's date in real time
const today = new Date();
const formattedDate = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
dateInput.value = formattedDate;

// Input Validation
accountNumberInput.addEventListener('input', () => {
    accountNumberInput.value = accountNumberInput.value.replace(/[^0-9]/g, '').slice(0, 18);
});

ifscCodeInput.addEventListener('input', () => {
    ifscCodeInput.value = ifscCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
});

const mobileInput = document.querySelector('input[type="tel"]');
mobileInput.addEventListener('input', () => {
    mobileInput.value = mobileInput.value.replace(/[^0-9]/g, '').slice(0, 10);
});

// Add item logic
let itemCount = 0;
addItemBtn.addEventListener('click', () => {
    itemCount++;
    const row = itemTable.insertRow();

    row.innerHTML = `
        <td>${itemCount}</td>
        <td><input type="text" placeholder="Item Name" required /></td>
        <td><input type="number" placeholder="Quantity" min="1" required /></td>
        <td><input type="number" placeholder="Price" min="0" required /></td>
        <td class="totalPrice">0</td>
        <td class="grandTotal">0</td>
    `;

    const qtyInput = row.cells[2].querySelector('input');
    const priceInput = row.cells[3].querySelector('input');
    const totalPriceCell = row.cells[4];

    qtyInput.addEventListener('input', calculateTotal);
    priceInput.addEventListener('input', calculateTotal);

    function calculateTotal() {
        const qty = parseFloat(qtyInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        totalPriceCell.textContent = (qty * price).toFixed(2);
        calculateGrandTotal();
    }
});

// Calculate Grand Total
function calculateGrandTotal() {
    let grandTotal = 0;
    document.querySelectorAll('.totalPrice').forEach(cell => {
        grandTotal += parseFloat(cell.textContent) || 0;
    });
    document.querySelectorAll('.grandTotal').forEach(cell => {
        cell.textContent = grandTotal.toFixed(2);
    });
}

// Save Invoice Logic
saveBtn.addEventListener('click', () => {
    const invoiceData = {
        accountNumber: accountNumberInput.value,
        ifscCode: ifscCodeInput.value,
        pageNo: pageNoInput.value,
        date: dateInput.value,
        customerName: document.querySelector('input[placeholder="Customer Name"]').value,
        mobileNumber: mobileInput.value,
        place: document.querySelector('select').value,
        items: []
    };

    document.querySelectorAll('#itemtable tr').forEach((row, index) => {
        if (index === 0) return;
        const cells = row.cells;
        invoiceData.items.push({
            item: cells[1].querySelector('input').value,
            quantity: cells[2].querySelector('input').value,
            price: cells[3].querySelector('input').value,
            totalPrice: cells[4].textContent
        });
    });

    const history = JSON.parse(localStorage.getItem('invoiceHistory')) || [];
    history.push(invoiceData);
    localStorage.setItem('invoiceHistory', JSON.stringify(history));

    // Increment and save the page number
    pageNo = Math.min(pageNo + 1, 9000);
    localStorage.setItem('lastPageNo', pageNo);

    alert('Invoice saved successfully!');
});


shareBtn.addEventListener('click', () => {
    // Create style adjustments for printing
    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
            body {
                -webkit-print-color-adjust: exact; /* Ensures colors are preserved */
                print-color-adjust: exact;
            }

            /* Hide buttons during print */
            .navbar, #addItemBtn, #saveBtn, #shareBtn {
                display: none;
            }

            /* Split into two pages */
            .heading {
                padding: 10px;
                margin-bottom: 20px;
            }

            .custom {
                padding: 10px;
                margin-bottom: 20px;
                page-break-after: always; /* Force content to move to the second page */
            }

            .itemTables, .history table {
                width: 100%;
            }

            .history table {
                font-size: 12px; /* Adjust table font size */
            }

            table, th, td {
                border: 1px solid #000 !important; /* Force visible borders */
            }

            footer {
                text-align: center;
                padding: 15px;
            }

            @page {
                size: A4 portrait; /* Set A4 portrait orientation */
                margin: 10mm; /* Set margins */
            }
        }
    `;
    document.head.appendChild(style);

    // Trigger print
    window.print();
});
