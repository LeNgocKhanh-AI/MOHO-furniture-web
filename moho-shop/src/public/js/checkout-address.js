// =====================
// GLOBAL DATA CACHE
// =====================
let VN_DATA = [];

// =====================
// ELEMENTS
// =====================
const provinceSelect = document.getElementById("province");
const districtSelect = document.getElementById("district");
const wardSelect = document.getElementById("ward");

const addressInput = document.querySelector("input[name='address']");

const shippingPlaceholder = document.getElementById("shippingPlaceholder");
const shippingOption = document.getElementById("shippingOption");

// =====================
// LOAD ALL ADDRESS DATA (NO CORS ISSUE)
// =====================
async function loadAllAddress() {
    try {
        const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
        VN_DATA = await res.json();

        renderProvinces();
    } catch (err) {
        console.error("Load address failed:", err);
    }
}

// =====================
// RENDER PROVINCES
// =====================
function renderProvinces() {
    provinceSelect.innerHTML = `<option value="">Chọn Tỉnh/Thành</option>`;

    VN_DATA.forEach(p => {
        provinceSelect.innerHTML += `<option value="${p.code}" data-name="${p.name}">${p.name}</option>`;
    });
}

// =====================
// PROVINCE CHANGE -> DISTRICTS
// =====================
provinceSelect.addEventListener("change", function () {
    districtSelect.innerHTML = `<option value="">Chọn Quận/Huyện</option>`;
    wardSelect.innerHTML = `<option value="">Chọn Phường/Xã</option>`;

    const province = VN_DATA.find(p => p.code == this.value);
    if (!province) return;

    province.districts.forEach(d => {
        districtSelect.innerHTML += `<option value="${d.code}" data-name="${d.name}">${d.name}</option>`;
    });

    checkAddress();
});

// =====================
// DISTRICT CHANGE -> WARDS
// =====================
districtSelect.addEventListener("change", function () {
    wardSelect.innerHTML = `<option value="">Chọn Phường/Xã</option>`;

    const province = VN_DATA.find(p => p.code == provinceSelect.value);
    if (!province) return;

    const district = province.districts.find(d => d.code == this.value);
    if (!district) return;

    district.wards.forEach(w => {
        wardSelect.innerHTML += `
            <option value="${w.name}">
                ${w.name}
            </option>
        `;
    });

    checkAddress();
});

// =====================
// PAYMENT TOGGLE
// =====================
const bankInfo = document.getElementById("bankInfo");
const radios = document.querySelectorAll("input[name='paymentMethod']");

function handlePaymentChange(value) {
    bankInfo.style.display = value === "bank" ? "block" : "none";
}

const checked = document.querySelector("input[name='paymentMethod']:checked");
if (checked) handlePaymentChange(checked.value);

radios.forEach(radio => {
    radio.addEventListener("change", e => {
        handlePaymentChange(e.target.value);
    });
});

// =====================
// ADDRESS VALIDATION
// =====================
function checkAddress() {
    if (
        addressInput?.value.trim() &&
        provinceSelect.value &&
        districtSelect.value &&
        wardSelect.value
    ) {
        shippingPlaceholder.style.display = "none";
        shippingOption.style.display = "block";
    } else {
        shippingPlaceholder.style.display = "block";
        shippingOption.style.display = "none";
    }
}

addressInput?.addEventListener("input", checkAddress);
provinceSelect?.addEventListener("change", checkAddress);
districtSelect?.addEventListener("change", checkAddress);
wardSelect?.addEventListener("change", checkAddress);

// =====================
// GET FULL ADDRESS (FOR ORDER)
// =====================
function getFullAddress() {
    const province = VN_DATA.find(p => p.code == provinceSelect.value);
    const district = province?.districts.find(d => d.code == districtSelect.value);
    const wardName = wardSelect.value;

    return {
        province: {
            code: province?.code,
            name: province?.name
        },
        district: {
            code: district?.code,
            name: district?.name
        },
        ward: {
            name: wardName
        },
        detail: addressInput.value.trim(),
        fullText: `${addressInput.value}, ${wardName}, ${district?.name}, ${province?.name}`
    };
}
document.getElementById("checkoutForm").addEventListener("submit", function (e) {
    const provOpt = provinceSelect.options[provinceSelect.selectedIndex];
    const distOpt = districtSelect.options[districtSelect.selectedIndex];

    setHidden(this, "province", provOpt?.dataset.name || provOpt?.text || "");
    setHidden(this, "district", distOpt?.dataset.name || distOpt?.text || "");
});

function setHidden(form, name, value) {
    let input = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!input) {
        input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        form.appendChild(input);
    }
    input.value = value;
}

// =====================
// INIT
// =====================
loadAllAddress();