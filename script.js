import { db, addDoc, collection } from './firebase-config.js';

document.getElementById("save-generate").addEventListener("click", saveAndGenerate);

async function saveAndGenerate() {
    try {
        // Collect invoice data before PDF rendering
        const invoiceDate = document.getElementById("invoice-date").value;
        const invoiceType = document.getElementById("invoice-type").value;
        const clientAddress = document.getElementById("client-address").value;
        const notes = document.getElementById("notes").value;
        const grandTotal = document.getElementById("grand-total").innerText;
        const content = document.getElementById("invoiceContent") || document.querySelector(".container");

        // Save to Firebase
        await addDoc(collection(db, "invoices"), {
            date: invoiceDate,
            type: invoiceType,
            client: clientAddress,
            notes: notes,
            total: grandTotal,
            timestamp: new Date()
        });

        console.log("Invoice saved to Firebase ✔");

        // Add PDF styling temporarily
        content.classList.add("pdf-mode");

        // Force page render → then Auto Download PDF
        const options = {
            margin: 10,
            filename: `Invoice_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
                scale: 3,
                scrollX: 0,
                scrollY: 0
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        await html2pdf().set(options).from(content).save();

        console.log("PDF Export Completed ✔");

        // Remove PDF styling
        content.classList.remove("pdf-mode");

        alert("Invoice Saved & PDF Downloaded Successfully!");

    } catch (error) {
        console.error("Error:", error);
        alert("Error exporting. Check console.");
    }
}
