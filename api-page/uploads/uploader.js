/* ---------- Konfigurasi ---------- */
// nggak perlu simpan token lagi di frontend
// cukup tau endpoint backend
const BACKEND_URL = "https://files.ryuu-dev.offc.my.id/api/upload";
/* -------------------------------- */

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');
const result = document.getElementById('result');
const themeToggle = document.getElementById('themeToggle');

/* theme toggle */
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

/* drag drop logic */
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  if (e.dataTransfer?.files?.length) {
    fileInput.files = e.dataTransfer.files;
    showFileName();
  }
});

fileInput.addEventListener('change', showFileName);
uploadBtn.addEventListener('click', uploadFile);
clearBtn.addEventListener('click', () => {
  fileInput.value = '';
  filePreview.innerHTML = '';
  result.innerHTML = '';
});

/* tampilkan nama file */
function showFileName(){
  const file = fileInput.files[0];
  if (file) {
    filePreview.innerHTML = `📂 File dipilih: <span class="font-semibold">${escapeHtml(file.name)}</span> — ${(file.size/1024/1024).toFixed(2)} MB`;
  } else {
    filePreview.innerHTML = '';
  }
}

/* upload ke GitHub */
/* upload ke Backend */
async function uploadFile() {
  const file = fileInput.files[0];
  if (!file) {
    result.innerHTML = '<p class="text-red-600 dark:text-red-400">⚠️ Pilih file dulu ya, MikuHost ~</p>';
    return;
  }
  if (file.size > 20 * 1024 * 1024) { // max 20MB
    result.innerHTML = '<p class="text-red-600 dark:text-red-400">❌ File terlalu besar (max 20MB)</p>';
    return;
  }

  result.innerHTML = `<p class="text-slate-500 dark:text-slate-400">⏳ Mengupload <strong>${escapeHtml(file.name)}</strong>...</p>`;

  try {
    const formData = new FormData();
    formData.append("file", file); 

    const resp = await axios.post(BACKEND_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    if (resp.data.success) {
      const url = resp.data.url;
      result.innerHTML = `
        <p class="text-green-600 dark:text-green-400 font-semibold">✅ Berhasil diupload!</p>
        <p>📂 File: <strong>${escapeHtml(file.name)}</strong></p>
        <button id="copyBtn" class="mt-3 px-4 py-2 rounded neon-btn text-white">Salin Link 📋</button>
        <p class="text-slate-500 dark:text-slate-400 mt-2">${escapeHtml(url)}</p>
      `;
      document.getElementById('copyBtn').addEventListener('click', () => copyToClipboard(url));
    } else {
      result.innerHTML = '<p class="text-red-600 dark:text-red-400">❌ Upload gagal.</p>';
    }
  } catch (err) {
    console.error(err);
    result.innerHTML = '<p class="text-red-600 dark:text-red-400">❌ Error saat upload — cek console.</p>';
  }
}

/* salin ke clipboard */
function copyToClipboard(text){
  navigator.clipboard?.writeText(text).then(() => {
    alert('Link berhasil disalin ke clipboard!');
  }).catch((e) => {
    console.error(e);
    alert('Gagal menyalin.');
  });
}

/* helper: escape HTML */
function escapeHtml(s) {
  return (s+'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}