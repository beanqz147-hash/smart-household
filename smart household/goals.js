document.addEventListener("DOMContentLoaded", function() {

    if (!currentUser()) return;

    const form = document.getElementById("goalForm");

    function renderGoals() {
        const goals = getData("goals");
        const list = document.getElementById("goalList");

        if (!goals.length) {
            list.innerHTML = '<p class="muted">No financial goals created yet.</p>';
            return;
        }

        list.innerHTML = goals.map(goal => {

            const percentage = Math.min(
                100,
                (goal.saved / goal.target) * 100
            );

            const remaining = Math.max(0, goal.target - goal.saved);

            return `
                <div class="goal-item">
                    <h4>${escapeHTML(goal.name)}</h4>

                    <p class="muted">
                        Target date: ${escapeHTML(goal.date)}
                    </p>

                    <h3>${money(goal.saved)}</h3>
                    <p class="muted">of ${money(goal.target)}</p>

                    <div class="progress-track">
                        <div class="progress-fill"
                            style="width:${percentage}%">
                        </div>
                    </div>

                    <div class="item-actions">
                        <span>${percentage.toFixed(1)}% completed</span>
                        <strong>${money(remaining)} left</strong>
                    </div>

                    <div class="item-actions">
                        <button onclick="addContribution('${goal.id}')">
                            + Add Savings
                        </button>

                        <button class="delete-btn"
                            onclick="deleteGoal('${goal.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("goalName").value.trim();
        const target = Number(document.getElementById("goalTarget").value);
        const saved = Number(document.getElementById("goalSaved").value);
        const date = document.getElementById("goalDate").value;

        if (!name || !date || !Number.isFinite(target) ||
            !Number.isFinite(saved) || target <= 0 ||
            saved < 0 || saved > target) {

            showMessage("goalMessage", "Enter valid goal details. Initial savings cannot exceed the target.", true);
            return;
        }

        const goals = getData("goals");

        goals.push({
            id: crypto.randomUUID(),
            name,
            target,
            saved,
            date
        });

        saveData("goals", goals);

        form.reset();
        document.getElementById("goalSaved").value = 0;

        showMessage("goalMessage", "Savings goal created successfully.");

        renderGoals();
    });

    window.addContribution = function(id) {
        const goals = getData("goals");

        const goal = goals.find(item => item.id === id);

        if (!goal) return;

        const amount = Number(
            prompt("Enter the amount you want to add (KSh):")
        );

        if (!Number.isFinite(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        if (amount > goal.target - goal.saved) {
            alert("The contribution cannot exceed the remaining target.");
            return;
        }

        goal.saved += amount;

        saveData("goals", goals);

        renderGoals();
    };

    window.deleteGoal = function(id) {
        if (!confirm("Delete this savings goal?")) return;

        saveData(
            "goals",
            getData("goals").filter(item => item.id !== id)
        );

        renderGoals();
    };

    renderGoals();
});