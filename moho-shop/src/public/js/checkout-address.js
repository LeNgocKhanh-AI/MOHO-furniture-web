const provinceSelect =
    document.getElementById("province");

const districtSelect =
    document.getElementById("district");

const wardSelect =
    document.getElementById("ward");

async function loadProvinces() {

    const res = await fetch(
        "https://provinces.open-api.vn/api/p/"
    );

    const provinces =
        await res.json();

    provinces.forEach(province => {

        provinceSelect.innerHTML += `
            <option value="${province.name}">
                ${province.name}
            </option>
        `;
    });
}

provinceSelect.addEventListener(
    "change",
    async function () {

        districtSelect.innerHTML =
            '<option value="">Chọn Quận/Huyện</option>';

        wardSelect.innerHTML =
            '<option value="">Chọn Phường/Xã</option>';

        const res = await fetch(
            "https://provinces.open-api.vn/api/p/"
            + this.selectedIndex
            + "?depth=2"
        );

        const data =
            await res.json();

        data.districts.forEach(d => {

            districtSelect.innerHTML += `
                <option value="${d.name}"
                    data-code="${d.code}">
                    ${d.name}
                </option>
            `;
        });
    }
);

districtSelect.addEventListener(
    "change",
    async function () {

        const code =
            this.options[this.selectedIndex]
                .dataset.code;

        wardSelect.innerHTML =
            '<option value="">Chọn Phường/Xã</option>';

        const res = await fetch(
            "https://provinces.open-api.vn/api/d/"
            + code
            + "?depth=2"
        );

        const data =
            await res.json();

        data.wards.forEach(w => {

            wardSelect.innerHTML += `
                <option value="${w.name}">
                    ${w.name}
                </option>
            `;
        });
    }
);

loadProvinces();
const bankInfo = document.getElementById("bankInfo");
const shippingText = document.getElementById("shippingMethodText");

const radios = document.querySelectorAll("input[name='paymentMethod']");

// ===== PAYMENT TOGGLE =====
function handlePaymentChange(value) {
    if (value === "bank") {
        bankInfo.style.display = "block";
    } else {
        bankInfo.style.display = "none";
    }
}

// init default
const checked = document.querySelector("input[name='paymentMethod']:checked");
if (checked) {
    handlePaymentChange(checked.value);
}

// listen change
radios.forEach(radio => {
    radio.addEventListener("change", (e) => {
        handlePaymentChange(e.target.value);
    });
});


// ===== ADDRESS CHECK (GIỮ NGUYÊN LOGIC BẠN) =====
const province = document.getElementById("province");
const district = document.getElementById("district");
const ward = document.getElementById("ward");

const shippingPlaceholder =
    document.getElementById("shippingPlaceholder");

const shippingOption =
    document.getElementById("shippingOption");
const addressInput =
    document.querySelector("input[name='address']");
function checkAddress() {

    if (
        addressInput.value.trim() &&
        province.value &&
        district.value &&
        ward.value
    ) {

        shippingPlaceholder.style.display = "none";
        shippingOption.style.display = "block";

    } else {

        shippingPlaceholder.style.display = "block";
        shippingOption.style.display = "none";
    }
}

addressInput.addEventListener(
    "input",
    checkAddress
);
province?.addEventListener("change", checkAddress);
district?.addEventListener("change", checkAddress);
ward?.addEventListener("change", checkAddress);