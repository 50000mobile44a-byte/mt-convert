let selectedFile;
const dropZone = document.getElementById("dropZone");
const videoPreview = document.getElementById("videoPreview");
const gifPreview = document.getElementById("gifPreview");

document.getElementById("fps").oninput = function () {
    document.getElementById("fpsValue").innerText = this.value;
};

document.getElementById("originalSize").addEventListener("change", e => {
    document.getElementById("width").disabled = e.target.checked;
});

dropZone.onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4";
    input.onchange = e => handleFile(e.target.files[0]);
    input.click();
};

dropZone.ondragover = e => e.preventDefault();
dropZone.ondrop = e => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
};

function handleFile(file) {
    selectedFile = file;
    dropZone.innerText = file.name;
    videoPreview.src = URL.createObjectURL(file);
    videoPreview.style.display = "block";
}

function upload() {
    if (!selectedFile) return alert("Select file first");

    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("fps", document.getElementById("fps").value);
    formData.append("width", document.getElementById("width").value);
    formData.append("duration", document.getElementById("duration").value);
    formData.append("originalSize", document.getElementById("originalSize").checked);
    // formData.append("quality", document.getElementById("quality").value);
    const quality = document.querySelector('input[name="quality"]:checked').value;
    formData.append("quality", quality);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/convert", true);
    xhr.responseType = "blob";

    xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            document.getElementById("progressBar").style.width = percent + "%";
            document.getElementById("progressText").innerText = Math.round(percent) + "%";
        }
    };

    // xhr.onload = function () {
    //     const url = URL.createObjectURL(xhr.response);
    //     gifPreview.src = url;
    //     gifPreview.style.display = "block";
    //     document.getElementById("progressBar").style.width = "0%";
    //     document.getElementById("progressText").innerText = "";
    // };
    // xhr.onload = function () {

    //     if (xhr.status !== 200) {
    //         alert("Conversion failed");
    //         return;
    //     }

    //     const blob = xhr.response;
    //     const url = URL.createObjectURL(blob);

    //     // ✅ แสดง preview
    //     gifPreview.src = url;
    //     gifPreview.style.display = "block";

    //     // รอให้โหลดเสร็จจริงก่อนค่อย revoke
    //     gifPreview.onload = () => {
    //         URL.revokeObjectURL(url);
    //     };

    //     // ✅ ดาวน์โหลดอัตโนมัติ
    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = "output.gif";
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);

    //     // รีเซ็ต progress
    //     document.getElementById("progressBar").style.width = "0%";
    //     document.getElementById("progressText").innerText = "";
    // };
    xhr.onload = function () {

        const blob = xhr.response;
        const url = URL.createObjectURL(blob);

        // แสดง preview
        // gifPreview.src = url;
        // gifPreview.style.display = "block";

        // 🔥 สั่งดาวน์โหลดไฟล์
        const a = document.createElement("a");
        a.href = url;
        a.download = "output.gif";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        document.getElementById("progressBar").style.width = "0%";
        document.getElementById("progressText").innerText = "";
    };

    xhr.send(formData);
}

const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

let selectedImageFile;

imageInput.addEventListener("change", function (e) {
    selectedImageFile = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        imagePreview.src = event.target.result;
        imagePreview.style.display = "block";
    };
    reader.readAsDataURL(selectedImageFile);
});

function convertImage() {
    const file = document.getElementById("imageInput").files[0];
    if (!file) return alert("Select image first");

    const format = document.getElementById("convertFormat").value;
    const quality = parseFloat(document.getElementById("imgQuality").value);
    const useOriginal = document.getElementById("imgOriginalSize").checked;

    const inputWidth = parseInt(document.getElementById("imgWidth").value);
    const inputHeight = parseInt(document.getElementById("imgHeight").value);

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        let width = img.width;
        let height = img.height;

        if (!useOriginal) {

            if (inputWidth && inputHeight) {
                width = inputWidth;
                height = inputHeight;
            }
            else if (inputWidth) {
                width = inputWidth;
                height = Math.round((img.height / img.width) * inputWidth);
            }
            else if (inputHeight) {
                height = inputHeight;
                width = Math.round((img.width / img.height) * inputHeight);
            }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(function (blob) {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "converted";
            a.click();
        }, format, quality);
    };
}
document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", function () {

        document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");

        document.querySelectorAll(".mode-section").forEach(sec => {
            sec.classList.remove("active");
        });

        document.getElementById(this.dataset.mode).classList.add("active");
    });
});

// const imageInput = document.getElementById("imageInput");
const imageUploadBox = document.getElementById("imageUploadBox");

imageUploadBox.onclick = () => imageInput.click();

imageUploadBox.ondragover = e => e.preventDefault();

imageUploadBox.ondrop = e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
        imageInput.files = e.dataTransfer.files;
        previewImage(file);
    }
};

imageInput.addEventListener("change", function () {
    if (this.files[0]) previewImage(this.files[0]);
});

function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById("imagePreview").src = e.target.result;
        document.getElementById("imagePreview").style.display = "block";
    };
    reader.readAsDataURL(file);
}

const selectBox = document.getElementById("formatSelect");
const selected = selectBox.querySelector(".select-selected");
const items = selectBox.querySelector(".select-items");
const hiddenInput = document.getElementById("convertFormat");

selected.addEventListener("click", () => {
    items.classList.toggle("select-hide");
});

items.querySelectorAll("div").forEach(option => {
    option.addEventListener("click", function () {
        selected.innerText = this.innerText;
        hiddenInput.value = this.dataset.value;
        items.classList.add("select-hide");
    });
});

document.addEventListener("click", e => {
    if (!selectBox.contains(e.target)) {
        items.classList.add("select-hide");
    }
});