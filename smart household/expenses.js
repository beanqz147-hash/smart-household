document.addEventListener("DOMContentLoaded", function() {

    if (!currentUser()) return;

    const form = document.getElementById("expenseForm");

    function renderExpenses() {
        const expenses = getData("expenses");

        document.getElementById("expenseTotal").textContent =
            money(total(expenses));

        const list = document.getElementById("expenseList");

        if (!expenses.length) {
            list.innerHTML = '<tr><td colspan="5">No expense records found.</td></tr>';
            return;
        }

        list.innerHTML = expenses.map(item => `
            <tr>
                <td>${escapeHTML(item.name)}</td>
                <td>${escapeHTML(item.category)}</td>
                <td>${escapeHTML(item.date)}</td>
                <td>${money(item.amount)}</td>
                <td>
                    <button class="delete-btn"
                        onclick="deleteExpense('${item.id}')">Delete</button>
                </td>
            </tr>
        `).join("");
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("expenseName").value.trim();
        const amount = Number(document.getElementById("expenseAmount").value);
        const category = document.getElementById("expenseCategory").value;
        const date = document.getElementById("expenseDate").value;
        const description = document.getElementById("expenseDescription").value.trim();

        if (!name || !date || !Number.isFinite(amount) || amount <= 0) {
            showMessage("expenseMessage", "Enter valid expense details.", true);
            return;
        }

        const expenses = getData("expenses");

        expenses.push({
            id: crypto.randomUUID(),
            name,
            amount,
            category,
            date,
            description
        });

        saveData("expenses", expenses);

        form.reset();
        document.getElementById("expenseDate").value = today();

        showMessage("expenseMessage", "Expense recorded successfully.");

        renderExpenses();
    });

    window.deleteExpense = function(id) {
        if (!confirm("Delete this expense record?")) return;

        const expenses = getData("expenses").filter(item => item.id !== id);

        saveData("expenses", expenses);
        renderExpenses();
    };

    renderExpenses();
});