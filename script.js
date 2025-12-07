import { db, ref, push, set } from './firebase-config.js';

const tableBody = document.querySelector("#invoice-table tbody");
const grandTotalEl = document.getElementById("grand-total");
let itemCount = 0;

// Add Item
document.getElementById("add-item").addEventListener("click", () => {
  itemCount++;
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${itemCount}</td>
    <td><input type="text" placeholder="Description"></td>
    <td><input type="number" min="1" value="1" class="qty"></td>
    <td><input type="number" min="0" value="0" class="price"></td>
    <td class="total">0</td>
    <td><button class="delete">Delete</button></td>
  `;
  tableBody.appendChild(row);
  attachRowEvents(row);
});

// Clear All
document.getElementById("clear-all").addEventListener("click", () => {
  tableBody.innerHTML = "";
  itemCount = 0;
  updateGrandTotal();
});

// Calculate totals
function attachRowEvents(row) {
  const qtyInput = row.querySelector(".qty");
  const priceInput = row.querySelector(".price");
  const totalCell = row.querySelector(".total");
  const deleteBtn = row.querySelector(".delete");

  function updateRowTotal() {
    const qty = parseFloat(qtyInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    totalCell.innerText = (qty * price).toFixed(2);
    updateGrandTotal();
  }

  qtyInput.addEventListener("input", updateRowTotal);
  priceInput.addEventListener("input", updateRowTotal);

  deleteBtn.addEventListener("click", () => {
    row.remove();
    updateGrandTotal();
  });
}

// Update grand total
function updateGrandTotal() {
  let total = 0;
  document.querySelectorAll("#invoice-table .total").forEach(td => {
    total += parseFloat(td.innerText) || 0;
  });
  grandTotalEl.innerText = `Grand Total: ${total.toFixed(2)}`;
}

// Save to Firebase & Generate PDF
document.getElementById("save-generate").addEventListener("click", async () => {
  const items = [];
  tableBody.querySelectorAll("tr").forEach(row => {
    const description = row.querySelector("td:nth-child(2) input").value;
    const qty = row.querySelector(".qty").value;
    const price = row.querySelector(".price").value;
    const total = row.querySelector(".total").innerText;
    items.push({ description, qty, price, total });
  });

  const invoiceData = {
    date: document.getElementById("invoice-date").value,
    type: document.getElementById("invoice-type").value,
    client: document.getElementById("client-address").value,
    notes: document.getElementById("notes").value,
    total: grandTotalEl.innerText.replace("Grand Total: ", ""),
    items,
    timestamp: new Date().toISOString()
  };

  try {
    const newRef = push(ref(db, "invoices/"));
    await set(newRef, invoiceData);
    console.log("Saved to Firebase ✔✔✔");

    downloadPDF();

  } catch (err) {
    console.error("Firebase Save Error:", err);
    alert("Failed saving invoice!");
  }
});

// PDF Download
function downloadPDF() {
  const container = document.getElementById("invoice-container");
  container.classList.add("pdf-mode");
  html2pdf().from(container).save("Invoice.pdf").then(() => {
    container.classList.remove("pdf-mode");
  });
}
