document.addEventListener("DOMContentLoaded", function() {

    if (!currentUser()) return;

    const form = document.getElementById("incomeForm");

    function renderIncome() {
        const incomes = getData("income");

        document.getElementById("incomeTotal").textContent =
            money(total(incomes));

        const list = document.getElementById("incomeList");

        if (!incomes.length) {
            list.innerHTML = '<tr><td colspan="5">No income records found.</td></tr>';
            return;
        }

        list.innerHTML = incomes.map(item => `
            <tr>
                <td>${escapeHTML(item.name)}</td>
                <td>${escapeHTML(item.category)}</td>
                <td>${escapeHTML(item.date)}</td>
                <td>${money(item.amount)}</td>
                <td>
                    <button class="delete-btn"
                        onclick="deleteIncome('${item.id}')">Delete</button>
                </td>
            </tr>
        `).join("");
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("incomeSource").value.trim();
        const amount = Number(document.getElementById("incomeAmount").value);
        const date = document.getElementById("incomeDate").value;
        const category = document.getElementById("incomeCategory").value;
        const description = document.getElementById("incomeDescription").value.trim();

        if (!name || !date || !Number.isFinite(amount) || amount <= 0) {
            showMessage("incomeMessage", "Enter valid income details.", true);
            return;
        }

        const incomes = getData("income");

        incomes.push({
            id: crypto.randomUUID(),
            name,
            amount,
            date,
            category,
            description
        });

        saveData("income", incomes);

        form.reset();
        document.getElementById("incomeDate").value = today();

        showMessage("incomeMessage", "Income recorded successfully.");

        renderIncome();
    });

    window.deleteIncome = function(id) {
        if (!confirm("Delete this income record?")) return;

        const incomes = getData("income").filter(item => item.id !== id);

        saveData("income", incomes);
        renderIncome();
    };

    renderIncome();
});