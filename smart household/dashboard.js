document.addEventListener("DOMContentLoaded", function() {

    if (!currentUser()) return;

    const incomes = getData("income");
    const expenses = getData("expenses");
    const goals = getData("goals");

    const incomeTotal = total(incomes);
    const expenseTotal = total(expenses);
    const balance = incomeTotal - expenseTotal;
    const savings = total(goals.map(goal => ({ amount: goal.saved })));

    document.getElementById("totalIncome").textContent = money(incomeTotal);
    document.getElementById("totalExpenses").textContent = money(expenseTotal);
    document.getElementById("balance").textContent = money(balance);
    document.getElementById("totalSavings").textContent = money(savings);

    // Recent transactions

    const transactions = [
        ...incomes.map(item => ({...item, type: "Income"})),
        ...expenses.map(item => ({...item, type: "Expense"}))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);

    const table = document.getElementById("recentTransactions");

    if (transactions.length === 0) {
        table.innerHTML = '<tr><td colspan="5">No transactions yet.</td></tr>';
    } else {
        table.innerHTML = transactions.map(item => `
            <tr>
                <td>${escapeHTML(item.name)}</td>
                <td>${escapeHTML(item.category)}</td>
                <td>${escapeHTML(item.date)}</td>
                <td>${item.type}</td>
                <td>${money(item.amount)}</td>
            </tr>
        `).join("");
    }

    // Monthly income and expenses chart

    const currentMonth = today().slice(0, 7);

    const monthlyIncome = incomes
        .filter(item => item.date.startsWith(currentMonth));

    const monthlyExpenses = expenses
        .filter(item => item.date.startsWith(currentMonth));

    new Chart(document.getElementById("financeChart"), {
        type: "bar",
        data: {
            labels: ["Income", "Expenses"],
            datasets: [{
                label: "Amount (KSh)",
                data: [total(monthlyIncome), total(monthlyExpenses)],
                backgroundColor: ["#8585ff", "#3988ff"],
                borderRadius: 7
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: "#cbd5e1" },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#cbd5e1" },
                    grid: { color: "#26324a" }
                }
            }
        }
    });

    // Expense category chart

    const categories = {};

    expenses.forEach(item => {
        categories[item.category] =
            (categories[item.category] || 0) + Number(item.amount);
    });

    const categoryLabels = Object.keys(categories);

    new Chart(document.getElementById("expenseChart"), {
        type: "doughnut",
        data: {
            labels: categoryLabels.length ? categoryLabels : ["No expenses"],
            datasets: [{
                data: categoryLabels.length ?
                    Object.values(categories) : [1],
                backgroundColor: [
                    "#8585ff", "#3988ff", "#24c78b",
                    "#ffae57", "#ed7197", "#54c6cf",
                    "#b18cff", "#a4b0c7"
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#cbd5e1" }
                }
            }
        }
    });
});