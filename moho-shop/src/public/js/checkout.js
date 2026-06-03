document.querySelectorAll(".payment-item").forEach(item => {
    item.onclick = () => {
        document.querySelectorAll(".payment-item")
            .forEach(i => i.classList.remove("active"));

        item.classList.add("active");
    }
});

document.querySelectorAll(".plus").forEach(btn => {
    btn.onclick = () => {
        let input = btn.previousElementSibling;
        input.value = parseInt(input.value) + 1;
    }
});

document.querySelectorAll(".minus").forEach(btn => {
    btn.onclick = () => {
        let input = btn.nextElementSibling;
        if (input.value > 1)
            input.value = parseInt(input.value) - 1;
    }
});