document.addEventListener("DOMContentLoaded", function() {

    if (!currentUser()) return;

    const incomes = getData("income");
    const expenses = getData("expenses");

    const incomeTotal = total(incomes);
    const expenseTotal = total(expenses);
    const balance = incomeTotal - expenseTotal;

    document.getElementById("reportIncome").textContent = money(incomeTotal);
    document.getElementById("reportExpenses").textContent = money(expenseTotal);
    document.getElementById("reportBalance").textContent = money(balance);

    // Income and expenses chart

    const months = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - i);

        months.push(
            date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, "0")
        );
    }

    const incomeData = months.map(month =>
        total(incomes.filter(item => item.date.startsWith(month)))
    );

    const expenseData = months.map(month =>
        total(expenses.filter(item => item.date.startsWith(month)))
    );

    new Chart(document.getElementById("reportFinanceChart"), {
        type: "line",
        data: {
            labels: months,
            datasets: [
                {
                    label: "Income",
                    data: incomeData,
                    borderColor: "#8585ff",
                    backgroundColor: "rgba(133,133,255,.15)",
                    fill: true,
                    tension: 0.4
                },
                {
                    label: "Expenses",
                    data: expenseData,
                    borderColor: "#3988ff",
                    backgroundColor: "rgba(57,136,255,.12)",
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: "#cbd5e1" }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#cbd5e1" },
                    grid: { color: "#26324a" }
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

    const labels = Object.keys(categories);

    new Chart(document.getElementById("reportExpenseChart"), {
        type: "pie",
        data: {
            labels: labels.length ? labels : ["No expenses"],
            datasets: [{
                data: labels.length ? Object.values(categories) : [1],
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

    // Transaction report

    const transactions = [
        ...incomes.map(item => ({...item, type: "Income"})),
        ...expenses.map(item => ({...item, type: "Expense"}))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const table = document.getElementById("reportTransactions");

    if (!transactions.length) {
        table.innerHTML = '<tr><td colspan="5">No transactions available.</td></tr>';
    } else {
        table.innerHTML = transactions.map(item => `
            <tr>
                <td>${escapeHTML(item.name)}</td>
                <td>${item.type}</td>
                <td>${escapeHTML(item.category)}</td>
                <td>${escapeHTML(item.date)}</td>
                <td>${money(item.amount)}</td>
            </tr>
        `).join("");
    }

    // CSV export

    window.exportReport = function() {

        const rows = [
            ["Description", "Type", "Category", "Date", "Amount"],
            ...transactions.map(item => [
                item.name,
                item.type,
                item.category,
                item.date,
                item.amount
            ])
        ];

        const csv = rows.map(row =>
            row.map(value =>
                '"' + String(value ?? "").replace(/"/g, '""') + '"'
            ).join(",")
        ).join("\n");

        const blob = new Blob(
            ["\uFEFF" + csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "household-financial-report.csv";

        link.click();

        URL.revokeObjectURL(url);
    };
});