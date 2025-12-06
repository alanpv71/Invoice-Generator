import { ref, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const db = window.db;

const companySelect = document.getElementById('company');
const companyAddress = document.getElementById('company-address');
const invoiceTable = document.querySelector('#invoice-table tbody');
const invoiceType = document.getElementById('invoice-type');
const grandTotalEl = document.getElementById('grand-total');
const advanceRowEl = document.getElementById('advance-row');
const netPayableEl = document.getElementById('net-payable');
let slNo = 0;

const companyData = {
  "evento.blr": {
    address: "4th Cross Road, Remco Bhel Layout, Ideal Homes Two, Rajarajeshwari Nagar, Bengaluru, Karnataka - 560098",
    services: ["Photography","Cinematography","Editing","Advance"]
  },
  "candela": {
    address: "4th Cross Road, Remco Bhel Layout, Ideal Homes Two, Rajarajeshwari Nagar, Bengaluru, Karnataka - 560098",
    services: ["Photography","Cinematography","Editing","Advance"]
  },
  "aditi": {
    address: "4th Cross Road, Remco Bhel Layout, Ideal Homes Two, Rajarajeshwari Nagar, Bengaluru, Karnataka - 560098",
    services: []
  }
};

// Company selection
companySelect.addEventListener('change', () => {
  const value = companySelect.value;
  companyAddress.innerText = value ? companyData[value].address : '';
  resetTable();
});

// Add Row
document.getElementById('add-item').addEventListener('click', addRow);
document.getElementById('clear-all').addEventListener('click', resetTable);

function addRow(){
  if(!companySelect.value){
    alert('Please select a company first!');
    return;
  }
  slNo++;
  const row = document.createElement('tr');

  const slCell = document.createElement('td'); slCell.innerText = slNo;

  const descCell = document.createElement('td');
  const selectedCompany = companySelect.value;
  if(selectedCompany==='aditi'){
    const input = document.createElement('input'); input.type='text';
    descCell.appendChild(input);
  } else {
    const select = document.createElement('select');
    companyData[selectedCompany].services.forEach(item=>{
      const option = document.createElement('option'); option.value=item; option.text=item;
      select.appendChild(option);
    });
    select.addEventListener('change', updateTotals);
    descCell.appendChild(select);
  }

  const qtyCell = document.createElement('td');
  const qtyInput = document.createElement('input'); qtyInput.type='number'; qtyInput.min=1; qtyInput.value=1;
  qtyInput.addEventListener('input', updateTotals);
  qtyCell.appendChild(qtyInput);

  const priceCell = document.createElement('td');
  const priceInput = document.createElement('input'); priceInput.type='number'; priceInput.value=0;
  priceInput.addEventListener('input', updateTotals);
  priceCell.appendChild(priceInput);

  const totalCell = document.createElement('td'); totalCell.innerText='₹0.00';

  const actionCell = document.createElement('td');
  const clearBtn = document.createElement('button'); clearBtn.innerText='Clear';
  clearBtn.onclick = () => { row.remove(); updateTotals(); };
  actionCell.appendChild(clearBtn);

  row.append(slCell, descCell, qtyCell, priceCell, totalCell, actionCell);
  invoiceTable.appendChild(row);
  updateTotals();
}

function updateSlNo(){
  const rows = invoiceTable.querySelectorAll('tr');
  rows.forEach((row,i)=> row.cells[0].innerText = i+1);
}

function updateTotals(){
  let grandTotal=0, advanceAmount=0;
  const rows = invoiceTable.querySelectorAll('tr');
  rows.forEach(row=>{
    const qty = parseFloat(row.cells[2].querySelector('input').value)||0;
    const price = parseFloat(row.cells[3].querySelector('input').value)||0;
    const total = qty*price;
    row.cells[4].innerText='₹'+total.toFixed(2);
    grandTotal+=total;

    const descEl = row.cells[1].querySelector('select,input');
    if(descEl && descEl.value==='Advance') advanceAmount+=total;
  });
  updateSlNo();
  grandTotalEl.innerText='Grand Total: ₹'+grandTotal.toFixed(2);
  if(advanceAmount>0){
    advanceRowEl.style.display='block';
    advanceRowEl.innerText='Advance: ₹'+advanceAmount.toFixed(2);
  } else advanceRowEl.style.display='none';
  netPayableEl.innerText='Net Payable: ₹'+(grandTotal-advanceAmount).toFixed(2);
}

function resetTable(){
  invoiceTable.innerHTML=''; slNo=0;
  updateTotals();
}

function generateInvoiceID(){
  const type = invoiceType.value==='Invoice'?'INV':'QTN';
  const dateVal = document.getElementById('invoice-date').value.replace(/-/g,'') || new Date().toISOString().slice(0,10).replace(/-/g,'');
  const random = Math.floor(1000 + Math.random()*9000);
  return `${type}-${dateVal}-${random}`;
}

function collectData(){
  const data = {
    invoiceID: generateInvoiceID(),
    company: companySelect.value,
    date: document.getElementById('invoice-date').value,
    clientAddress: document.getElementById('client-address').value,
    type: invoiceType.value,
    items: [],
    notes: document.getElementById('notes').value
  };
  const rows = invoiceTable.querySelectorAll('tr');
  rows.forEach(row=>{
    const desc = row.cells[1].querySelector('select,input')?.value || '';
    const qty = parseFloat(row.cells[2].querySelector('input')?.value) || 0;
    const price = parseFloat(row.cells[3].querySelector('input')?.value) || 0;
    data.items.push({desc, qty, price});
  });
  return data;
}

// Preview
document.getElementById('preview').addEventListener('click', ()=>{
  const data = collectData();
  const newWindow = window.open('', '_blank');
  let html = `<h2>${data.type} - ${data.invoiceID}</h2>`;
  html += `<p>Company: ${data.company}</p>`;
  html += `<p>Bill To: ${data.clientAddress}</p>`;
  html += `<table border="1" cellpadding="5" cellspacing="0"><tr><th>Sl</th><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>`;
  data.items.forEach((item,i)=>{
    html += `<tr><td>${i+1}</td><td>${item.desc}</td><td>${item.qty}</td><td>₹${item.price}</td><td>₹${(item.qty*item.price).toFixed(2)}</td></tr>`;
  });
  html += `</table>`;
  html += `<p>${grandTotalEl.innerText}</p>`;
  if(advanceRowEl.style.display==='block') html += `<p>${advanceRowEl.innerText}</p>`;
  html += `<p>${netPayableEl.innerText}</p>`;
  html += `<p>Notes: ${data.notes}</p>`;
  newWindow.document.write(html);
});

// Save & Generate
document.getElementById('save-generate').addEventListener('click', () => {
  const data = collectData();
  const invoiceRef = ref(db, 'invoices/' + data.invoiceID);
  set(invoiceRef, data)
    .then(() => alert('Saved successfully with ID: ' + data.invoiceID))
    .catch(err => alert('Error saving: ' + err));
});
