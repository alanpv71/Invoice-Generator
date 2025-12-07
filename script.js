import { db, ref, push, set } from './firebase-config.js';

document.getElementById("save-generate").addEventListener("click", saveAndGenerate);

async function saveAndGenerate() {
  try {
    const invoiceData = {
      date: document.getElementById("invoice-date").value,
      type: document.getElementById("invoice-type").value,
      client: document.getElementById("client-address").value,
      notes: document.getElementById("notes").value,
      total: document.getElementById("grand-total").innerText,
      timestamp: new Date().toISOString()
    };

    const newRef = push(ref(db, "invoices/"));
    await set(newRef, invoiceData);

    console.log("Saved to Firebase ✔✔✔");

    // After saving → Auto PDF Download
    downloadPDF();

  } catch (err) {
    console.error("Firebase Save Error:", err);
    alert("Failed saving invoice!");
  }
}
