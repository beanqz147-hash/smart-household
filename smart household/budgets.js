document.addEventListener("DOMContentLoaded", function() {

    if (!currentUser()) return;

    const form = document.getElementById("budgetForm");

    function renderBudgets() {
        const budgets = getData("budgets");
        const expenses = getData("expenses");
        const list = document.getElementById("budgetList");

        if (!budgets.length) {
            list.innerHTML = '<p class="muted">No budgets created yet.</p>';
            return;
        }

        list.innerHTML = budgets.map(budget => {

            const spent = total(expenses.filter(item =>
                item.category === budget.category &&
                item.date.startsWith(budget.month)
            ));

            const remaining = Number(budget.amount) - spent;

            const percentage = Math.min(
                100,
                (spent / budget.amount) * 100
            );

            const color = percentage >= 100 ? "#ff7474" :
                          percentage >= 80 ? "#ffae57" : "#24c78b";

            return `
                <div class="budget-item">
                    <h4>${escapeHTML(budget.category)}</h4>
                    <p class="muted">${escapeHTML(budget.month)}</p>

                    <div class="item-actions">
                        <span>Spent: ${money(spent)}</span>
                        <span>Limit: ${money(budget.amount)}</span>
                    </div>

                    <div class="progress-track">
                        <div class="progress-fill"
                            style="width:${percentage}%; background:${color}">
                        </div>
                    </div>

                    <div class="item-actions">
                        <span>${percentage.toFixed(1)}% used</span>
                        <strong>${money(remaining)} remaining</strong>
                    </div>

                    <div class="item-actions">
                        <span>${remaining < 0 ? "Over budget" : "Within budget"}</span>
                        <button class="delete-btn"
                            onclick="deleteBudget('${budget.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join("");
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const category = document.getElementById("budgetCategory").value;
        const amount = Number(document.getElementById("budgetAmount").value);
        const month = document.getElementById("budgetMonth").value;

        if (!month || !Number.isFinite(amount) || amount <= 0) {
            showMessage("budgetMessage", "Enter a valid budget amount and month.", true);
            return;
        }

        const budgets = getData("budgets");

        const existing = budgets.find(b =>
            b.category === category && b.month === month
        );

        if (existing) {
            existing.amount = amount;
        } else {
            budgets.push({
                id: crypto.randomUUID(),
                category,
                amount,
                month
            });
        }

        saveData("budgets", budgets);

        form.reset();
        document.getElementById("budgetMonth").value = today().slice(0, 7);

        showMessage("budgetMessage", "Budget saved successfully.");

        renderBudgets();
    });

    window.deleteBudget = function(id) {
        if (!confirm("Delete this budget?")) return;

        saveData(
            "budgets",
            getData("budgets").filter(item => item.id !== id)
        );

        renderBudgets();
    };

    renderBudgets();
});