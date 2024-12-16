// script.js

document.addEventListener("DOMContentLoaded", () => {
    const navbarContainer = document.getElementById("navbar-container");
    const contentContainer = document.getElementById("content");
    let currentClientId = null; // Untuk menyimpan client_id saat melihat jadwal khusus client

    function encryptData(data) {
        return btoa(JSON.stringify(data));
    }

    function decryptData(data) {
        try {
            return JSON.parse(atob(data));
        } catch (e) {
            return null;
        }
    }

    function getLoggedInUser() {
        const encryptedUser = sessionStorage.getItem('user');
        if (encryptedUser) {
            return decryptData(encryptedUser);
        }
        return null;
    }

    function renderNavbar() {
        const user = getLoggedInUser();

        if (user) {
            if (user.role === 'Admin') {
                navbarContainer.innerHTML = 
                    `<div class="navbar">
                        <div class="left-section">
                            <button class="profil-toggle-btn" onclick="toggleSidebar()">
                            </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   <span id="gender-icon" class="gender-icon"></span> Profil
                            </button>
                        </div>
                        <div class="navbar-links">
                            <a href="javascript:navigate('home')" id="nav-home" class="active">Home</a>
                            <a href="javascript:navigate('trainer_manage')" id="nav-trainer_manage">Kelola Trainer & User</a>
                            <a href="javascript:navigate('feedback_list')" id="nav-feedback_list">Daftar Masukan</a>
                            <a href="javascript:navigate('schedule')" id="nav-schedule">Jadwal Latihan</a>
                            <a href="javascript:navigate('about')" id="nav-about">Tentang</a>
                        </div>
                        <div class="right-section">
                            <span>${user.fullName} (${user.role})</span>
                            <button id="logoutButton" class="Log-Out">Log Out</button>
                        </div>
                    </div>`;
            } else if (user.role === 'Trainer') {
                navbarContainer.innerHTML = 
                    `<div class="navbar">
                        <div class="left-section">
                            <button class="profil-toggle-btn" onclick="toggleSidebar()">
                            </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   <span id="gender-icon" class="gender-icon"></span> Profil
                            </button>
                        </div>
                        <div class="navbar-links">
                            <a href="javascript:navigate('home')" id="nav-home" class="active">Home</a>
                            <a href="javascript:navigate('schedule')" id="nav-schedule">Jadwal Latihan (Semua)</a>
                            <a href="javascript:navigate('consultation_pelanggan')" id="nav-consultation_pelanggan">Konsultasi Pelanggan</a>
                            <a href="javascript:navigate('about')" id="nav-about">Tentang</a>
                        </div>
                        <div class="right-section">
                            <span>${user.fullName} (${user.role})</span>
                            <button id="logoutButton" class="Log-Out">Log Out</button>
                        </div>
                    </div>`;
            } else {
                navbarContainer.innerHTML = 
                    `<div class="navbar">
                        <div class="left-section">
                            <button class="profil-toggle-btn" onclick="toggleSidebar()">
                            </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="gender-icon" class="gender-icon"></span> Profil
                            </button>
                        </div>
                        <div class="navbar-links">
                            <a href="javascript:navigate('home')" id="nav-home" class="active">Home</a>
                            <a href="javascript:navigate('trainer')" id="nav-trainer">Trainer Gym</a>
                            <a href="javascript:navigate('schedule')" id="nav-schedule">Jadwal Latihan</a>
                            <a href="javascript:handleConsultation()" id="nav-consultation">Konsultasi</a>
                            <a href="javascript:navigate('about')" id="nav-about">Tentang</a>
                        </div>
                        <div class="right-section">
                            <span>${user.fullName} (${user.role})</span>
                            <button id="logoutButton" class="Log-Out">Log Out</button>
                        </div>
                    </div>`;
            }

            const genderIcon = document.getElementById('gender-icon');
            if (user.gender === 'Laki-laki') {
                genderIcon.classList.add('male');
            } else if (user.gender === 'Perempuan') {
                genderIcon.classList.add('female');
            } else {
                genderIcon.textContent = '♂♀';
            }
        } else {
            navbarContainer.innerHTML = 
                `<div class="navbar">
                    <div class="left-section">
                        <button class="profil-toggle-btn" onclick="toggleSidebar()" style="display: none;"></button>
                    </div>
                    <div class="navbar-links">
                        <a href="javascript:navigate('home')" id="nav-home" class="active">Home</a>
                        <a href="javascript:navigate('about')" id="nav-about">Tentang</a>
                    </div>
                    <div class="right-section">
                        <a href="login.html" class="Login-Register">Login</a>
                    </div>
                </div>`;
        }

        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', function() {
                fetch('logout.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        sessionStorage.removeItem('user');
                        alert('Logout berhasil.');
                        window.location.href = 'login.html';
                    } else {
                        alert('Gagal logout: ' + result.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Terjadi kesalahan saat logout.');
                });
            });
        }
    }

    function verifySession() {
        return fetch('get_user.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.user) {
                    sessionStorage.setItem('user', encryptData(data.user));
                } else {
                    sessionStorage.removeItem('user');
                }
            })
            .catch(error => {
                console.error('Error verifying session:', error);
                sessionStorage.removeItem('user');
            });
    }

    window.navigate = function (page, params = {}) {
        document.querySelectorAll(".navbar a").forEach(link => link.classList.remove("active"));
        const activeLink = document.getElementById(`nav-${page}`);
        if (activeLink) activeLink.classList.add("active");

        contentContainer.classList.remove("content-animate");
        setTimeout(() => contentContainer.classList.add("content-animate"), 10);

        if (params.client_id) {
            currentClientId = params.client_id;
        } else {
            currentClientId = null;
        }

        switch (page) {
            case "home":
                renderHomePage();
                break;
            case "trainer":
                renderTrainerPage();
                break;
            case "trainer_manage":
                renderTrainerManagePage();
                break;
            case "feedback_list":
                renderFeedbackListPage();
                break;
            case "consultation_pelanggan":
                renderConsultationPelangganPage();
                break;
            case "consultation":
                renderConsultationPage();
                break;
            case "payment":
                renderPaymentPage();
                break;
            case "schedule":
                renderSchedulePage();
                break;
            case "about":
                renderAboutPage();
                break;
            case "admin":
                renderAdminPage();
                break;
            case "client_schedule":
                renderClientSchedulePage(currentClientId);
                break;
            default:
                contentContainer.innerHTML = `<h1>404 - Page Not Found</h1>`;
        }
    };

    // Fungsi untuk Render Halaman Home
    function renderHomePage() {
        const user = getLoggedInUser();
        contentContainer.innerHTML = `
            <div class="home-section">
                <div class="trainup-image-section">
                    <div class="text-overlay">
                        <span class="train">Train</span><span class="up">Up</span>
                    </div>
                    <div class="image-section">
                        <img src="PIC/GYM3.png" alt="Fitness Gym">
                    </div>
                    <div class="gym-text">
                        <p>Selamat datang di TrainUp, tempat terbaik untuk mencapai kebugaran dan kesehatan Anda!</p>
                    </div>
                </div>

                <div class="program-section">
                    <h2>Program Latihan yang Tersedia</h2>
                    <ul>
                        <li><strong>Latihan Kekuatan:</strong> Fokus pada pengembangan otot melalui latihan dengan beban. Program ini ideal bagi mereka yang ingin meningkatkan massa otot dan kekuatan.</li>
                        <li><strong>Latihan Kardio:</strong> Dirancang untuk meningkatkan stamina dan kesehatan jantung. Program ini meliputi aktivitas seperti berlari, bersepeda, dan latihan kardio lainnya.</li>
                        <li><strong>HIIT (High-Intensity Interval Training):</strong> Latihan intensitas tinggi dengan waktu istirahat singkat, cocok untuk pembakaran kalori secara cepat.</li>
                    </ul>
                </div>

                <div class="instructor-section">
                    <img src="PIC/home3.png" alt="Instruktur Kami">
                    <h2>Trainer Kami</h2>
                    <p>Tim Trainer kami terdiri dari para profesional yang berpengalaman dan terlatih dalam berbagai jenis latihan. Trainer kami akan membantu Anda menyesuaikan program latihan sesuai kebutuhan dan kemampuan Anda. Mereka selalu siap memberikan bimbingan dan memastikan Anda mendapatkan hasil terbaik.</p>
                    <h3 class="centered-header">Pilih Trainer Anda Sekarang</h3>
                    <div class="button-center">
                        <a href="${user ? "javascript:navigate('trainer')" : "login.html"}" class="action-btn">
                            ${user ? "Pilih Trainer Anda" : "Login sekarang untuk memilih trainer"}
                        </a>
                    </div>
                </div>

                <div class="benefits-section">
                    <img src="PIC/home4.png" alt="Manfaat Latihan di Gym">
                    <h2>Manfaat Latihan di Gym</h2>
                    <ul>
                        <li><strong>Meningkatkan Kebugaran Fisik:</strong> Latihan rutin membantu meningkatkan kekuatan dan stamina tubuh.</li>
                        <li><strong>Menjaga Berat Badan Ideal:</strong> Program latihan kardio dan HIIT dapat membantu membakar kalori dan menjaga berat badan yang sehat.</li>
                        <li><strong>Meningkatkan Kesehatan Mental:</strong> Latihan fisik dapat mengurangi stres dan meningkatkan suasana hati.</li>
                        <li><strong>Meningkatkan Kualitas Hidup:</strong> Kebugaran yang baik akan meningkatkan energi dan produktivitas sehari-hari.</li>
                    </ul>
                </div>
            </div>`;
    }

    function renderTrainerPage() {
        const user = getLoggedInUser(); 
        fetch("get_users.php")
            .then((response) => response.json())
            .then((data) => {
                if (data.success && data.users) {
                    const trainers = data.users.filter((u) => u.role === "Trainer");
                    if (user && user.role === 'Client' && user.trainer && user.trainer.id) {
                        const chosenTrainer = trainers.find((t) => t.id == user.trainer.id);
                        if (chosenTrainer) {
                            contentContainer.innerHTML = `
                                <div class="trainer-chosen-section">
                                    <header>
                                        <h1>Trainer Anda</h1>
                                    </header>
                                    <div class="trainer-card">
                                        <div class="trainer-details">
                                            <img src="PIC/${chosenTrainer.gender === "Laki-laki" ? "pria.jpg" : "wanita.jpg"}" alt="${chosenTrainer.fullName}">
                                            <div class="trainer-info">
                                                <h3>${chosenTrainer.fullName}</h3>
                                                <p>Jenis Kelamin: ${chosenTrainer.gender}</p>
                                                <p>Spesialisasi: ${chosenTrainer.specialization}</p>
                                                <p>Pengalaman: ${chosenTrainer.experience} tahun</p>
                                                <p>Deskripsi: ${chosenTrainer.description}</p>
                                            </div>
                                        </div>
                                        <button type="button" class="action-btn" onclick="redirectToConsultation()">Hubungi ${chosenTrainer.fullName}</button>
                                        <button type="button" class="action-btn" onclick="removeTrainer()">Hapus Trainer</button>
                                    </div>
                                </div>
                            `;
                            return;
                        }
                    }

                    let trainerCards = "";
                    trainers.forEach((trainer) => {
                        trainerCards += `
                            <div class="trainer-card">
                                <div class="trainer-details">
                                    <img src="PIC/${trainer.gender === "Laki-laki" ? "pria.jpg" : "wanita.jpg"}" alt="${trainer.fullName}">
                                    <div class="trainer-info">
                                        <h3>${trainer.fullName}</h3>
                                        <p>Jenis Kelamin: ${trainer.gender}</p>
                                        <p>Spesialisasi: ${trainer.specialization}</p>
                                        <p>Pengalaman: ${trainer.experience} tahun</p>
                                        <p>Deskripsi: ${trainer.description}</p>
                                    </div>
                                </div>
                                <button type="button" class="hire-btn" data-id="${trainer.id}" data-name="${trainer.fullName}">
                                    ${user ? "Pilih Trainer" : "Login untuk pilih Trainer"}
                                </button>
                            </div>`;
                    });

                    let contentHtml = `
                        <div class="trainer-section">
                            <header>
                                <h1>Pilih Trainer Anda</h1>
                            </header>
                            <div class="trainer-container">
                                ${trainerCards || "<p>Belum ada trainer yang terdaftar.</p>"}
                            </div>
                        </div>`;

                    contentContainer.innerHTML = contentHtml;
                    
                    document.querySelectorAll(".hire-btn").forEach((button) => {
                        button.addEventListener("click", () => {
                            const trainerId = button.getAttribute("data-id");
                            const trainerName = button.getAttribute("data-name");
                            const user = getLoggedInUser();
                            if (user) {
                                initiatePayment(trainerId, trainerName);
                            } else {
                                promptLogin();
                            }
                        });
                    });
                } else {
                    contentContainer.innerHTML = "<p>Gagal memuat data trainer.</p>";
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                contentContainer.innerHTML = "<p>Terjadi kesalahan saat memuat data trainer.</p>";
            });
    }

    function renderTrainerManagePage() {
        fetch('kelola_trainer_user.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.users) {
                    let userCards = '';

                    data.users.forEach(user => {
                        userCards += 
                            `<div class="admin-card">
                                <p><strong>Nama:</strong> ${user.fullName}</p>
                                <p><strong>Username:</strong> ${user.username}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p><strong>Kontak:</strong> ${user.contact}</p>
                                <p><strong>Role:</strong> ${user.role}</p>
                                <button type="button" class="hapus-btn" onclick="hapusUser(${user.id})">Hapus</button>
                            </div>`;
                    });

                    contentContainer.innerHTML = 
                        `<div class="admin-section">
                            <h2>Kelola Trainer & User</h2>
                            <div class="admin-container">
                                ${userCards || '<p>Belum ada pengguna yang terdaftar.</p>'}
                            </div>
                        </div>`;
                } else {
                    contentContainer.innerHTML = `<p>Gagal memuat data pengguna.</p>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                contentContainer.innerHTML = `<p>Terjadi kesalahan saat memuat data pengguna.</p>`;
            });
    }

    window.hapusUser = function(userId) {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            fetch('hapus_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Pengguna berhasil dihapus.');
                    navigate('trainer_manage');
                } else {
                    alert(`Gagal menghapus pengguna: ${result.message}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat menghapus pengguna.');
            });
        }
    };

    function renderFeedbackListPage() {
        fetch('daftar_masukan.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.feedbacks) {
                    let feedbackCards = '';

                    data.feedbacks.forEach(feedback => {
                        feedbackCards += 
                            `<div class="feedback-card">
                                <p><strong>Dari:</strong> ${feedback.fullName ? `${feedback.fullName} (${feedback.username})` : 'Anonim'}</p>
                                <p><strong>Role:</strong> ${feedback.role}</p>
                                <p><strong>Masukan:</strong> ${feedback.feedback}</p>
                                <p><strong>Tanggal:</strong> ${feedback.created_at}</p>
                            </div>`;
                    });

                    contentContainer.innerHTML = 
                        `<div class="admin-section">
                            <h2>Daftar Masukan</h2>
                            <div class="admin-container">
                                ${feedbackCards || '<p>Belum ada masukan yang diterima.</p>'}
                            </div>
                        </div>`;
                } else {
                    contentContainer.innerHTML = `<p>Gagal memuat data masukan.</p>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                contentContainer.innerHTML = `<p>Terjadi kesalahan saat memuat data masukan.</p>`;
            });
    }

    function renderConsultationPelangganPage() {
        fetch('konsultasi_pelanggan.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.customers) {
                    let customerCards = '';

                    data.customers.forEach(customer => {
                        const whatsappLink = `https://wa.me/${customer.contact}?text=Halo%20${encodeURIComponent(customer.fullName)},%20saya%20ingin%20melakukan%20konsultasi.`;

                        customerCards += 
                            `<div class="customer-card">
                                <p><strong>Nama:</strong> ${customer.fullName}</p>
                                <p><strong>Username:</strong> ${customer.username}</p>
                                <p><strong>Email:</strong> ${customer.email}</p>
                                <p><strong>Kontak:</strong> ${customer.contact}</p>
                                <p><strong>Ditugaskan Pada:</strong> ${customer.assigned_at}</p>
                                <button onclick="window.open('${whatsappLink}', '_blank')" class="whatsapp-button">
                                    Hubungi ${customer.fullName}
                                </button>
                                <button onclick="viewClientSchedule(${customer.id})" class="action-btn">Lihat Jadwal Latihan</button>
                            </div>`;
                    });

                    contentContainer.innerHTML = 
                        `<div class="trainer-section">
                            <h2>Konsultasi Pelanggan</h2>
                            <div class="trainer-container">
                                ${customerCards || '<p>Belum ada pelanggan yang terdaftar.</p>'}
                            </div>
                        </div>`;
                } else {
                    contentContainer.innerHTML = `<p>Gagal memuat data pelanggan.</p>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                contentContainer.innerHTML = `<p>Terjadi kesalahan saat memuat data pelanggan.</p>`;
            });
    }

    window.viewClientSchedule = function(clientId) {
        navigate('client_schedule', { client_id: clientId });
    };

    function renderConsultationPage() {
        const user = getLoggedInUser();
        if (!user) {
            alert('Anda harus login terlebih dahulu untuk mengakses halaman ini.');
            navigate('home');
            return;
        }

        if (user.trainer && user.trainer.id) {
            contentContainer.innerHTML = 
                `<div class="consultation-section">
                    <h2>Konsultasi</h2>
                    <p>Kami akan segera mengarahkan konsultasi ke trainer Anda:</p>
                    <p><strong>${user.trainer.fullName}</strong></p>
                    <button type="button" class="action-btn" onclick="redirectToConsultation()">Lanjutkan Konsultasi</button>
                </div>`;
        } else {
            contentContainer.innerHTML = 
                `<div class="consultation-section">
                    <h2>Konsultasi</h2>
                    <p>Anda belum memiliki trainer. Silakan pilih trainer terlebih dahulu.</p>
                    <button type="button" class="action-btn" onclick="navigate('trainer')">Pilih Trainer Anda</button>
                </div>`;
        }
    }

    function renderPaymentPage() {
        const user = getLoggedInUser();
        if (!user || user.role !== 'Client' || !user.trainer) {
            alert('Anda harus login dan memilih trainer terlebih dahulu untuk mengakses halaman pembayaran.');
            navigate('home');
            return;
        }

        contentContainer.innerHTML = 
            `<div class="payment-section">
                <div class="payment-container">
                    <div class="header">
                        <h1>Pembayaran QRIS</h1>
                    </div>
                    <div class="instruction">
                        <p>Silakan scan QR code di bawah ini untuk melakukan pembayaran:</p>
                    </div>
                    <div class="qris-image">
                        <img src="PIC/Qriss.png" alt="QRIS QR Code">
                    </div>
                    <div class="amount">
                        <p>Jumlah Pembayaran: <strong>Rp100.000</strong></p>
                    </div>
                    <button class="confirm-btn" onclick="confirmPayment()">Konfirmasi Pembayaran</button>
                </div>
            </div>`;
    }

    function renderClientSchedulePage(clientId) {
        const user = getLoggedInUser();
        if (!user || user.role !== 'Trainer') {
            contentContainer.innerHTML = `<p>Hanya trainer yang dapat mengakses halaman ini.</p>`;
            return;
        }

        fetch(`get_trainer_schedule.php?client_id=${clientId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const schedules = data.schedules;
                    if (schedules.length === 0) {
                        contentContainer.innerHTML = `
                            <div class="scheduleno-section">
                                <h2>Jadwal Latihan Client</h2>
                                <p>Client ini belum memiliki jadwal latihan, buat jadwal latihan sekarang.</p>
                                <button class="action-btn" onclick="openAddModalClient(${clientId})">Tambah Jadwal</button>
                            </div>`;
                        return;
                    }

                    let scheduleHtml = `
                        <div class="schedule-section">
                            <h2>Jadwal Latihan Client</h2>
                            <table class="schedule-table">
                                <thead>
                                    <tr>
                                        <th>Hari</th>
                                        <th>Waktu Mulai</th>
                                        <th>Waktu Selesai</th>
                                        <th>Aktivitas</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;
                    schedules.forEach(sch => {
                        scheduleHtml += `
                            <tr>
                                <td>${sch.day}</td>
                                <td>${sch.time_start}</td>
                                <td>${sch.time_end}</td>
                                <td>${sch.activity}</td>
                                <td>
                                    <button class="edit-btn" onclick="openEditModal(${sch.id}, '${sch.day}', '${sch.time_start}', '${sch.time_end}', '${sch.activity}', ${clientId})">Edit</button>
                                    <button class="delete-btn" onclick="hapusJadwal(${sch.id}, ${clientId})">Hapus</button>
                                </td>
                            </tr>`;
                    });
                    scheduleHtml += `
                                </tbody>
                            </table>
                            <div class="button-center" style="margin-top:20px;">
                                <button class="action-btn" onclick="openAddModalClient(${clientId})">Tambah Jadwal</button>
                                <button class="action-btn" onclick="hapusSemuaJadwal(${clientId})">Hapus Semua Jadwal</button>
                            </div>
                        </div>`;
                    contentContainer.innerHTML = scheduleHtml;
                } else {
                    contentContainer.innerHTML = `<p>Gagal memuat jadwal.</p>`;
                }
            })
            .catch(error => {
                console.error(error);
                contentContainer.innerHTML = `<p>Terjadi kesalahan saat memuat jadwal.</p>`;
            });
    }

    function renderSchedulePage() {
        const user = getLoggedInUser();
    
        if (!user) {
            contentContainer.innerHTML = `
                <div>
                    <h2>Jadwal Latihan</h2>
                    <p>Anda harus login untuk melihat jadwal.</p>
                </div>`;
            return;
        }
        
        if (user.role === 'Trainer') {
            fetch("get_trainer_schedule.php")
                .then(response => response.json())
                .then(scheduleData => {
                    if (scheduleData.success) {
                        const schedules = scheduleData.schedules;
                        if (schedules.length === 0) {
                            contentContainer.innerHTML = `
                                <div>
                                    <h2>Jadwal Latihan (Semua Client)</h2>
                                    <p>Belum ada jadwal sama sekali.</p>
                                </div>`;
                            return;
                        }

                        const schedulesByClient = {};
                        schedules.forEach(sch => {
                            if (!schedulesByClient[sch.client_id]) {
                                schedulesByClient[sch.client_id] = {
                                    clientName: sch.client_name,
                                    schedules: []
                                };
                            }
                            schedulesByClient[sch.client_id].schedules.push(sch);
                        });

                        let scheduleHtml = `<div class="schedule-section"><h2>Jadwal Latihan Seluruh Client</h2>`;
                        for (const cid in schedulesByClient) {
                            const cl = schedulesByClient[cid];
                            scheduleHtml += `<div class="client-schedule-group">
                                <h3>${cl.clientName}</h3>
                                <table class="schedule-table">
                                    <thead>
                                        <tr>
                                            <th>Hari</th>
                                            <th>Waktu Mulai</th>
                                            <th>Waktu Selesai</th>
                                            <th>Aktivitas</th>
                                        </tr>
                                    </thead>
                                    <tbody>`;
                            cl.schedules.forEach(sch => {
                                scheduleHtml += `
                                    <tr>
                                        <td>${sch.day}</td>
                                        <td>${sch.time_start}</td>
                                        <td>${sch.time_end}</td>
                                        <td>${sch.activity}</td>
                                    </tr>`;
                            });
                            scheduleHtml += `</tbody></table></div>`;
                        }
                        scheduleHtml += `</div>`;
                        contentContainer.innerHTML = scheduleHtml;

                    } else {
                        contentContainer.innerHTML = `<p>Gagal memuat jadwal.</p>`;
                    }
                })
                .catch(error => {
                    console.error(error);
                    contentContainer.innerHTML = `<p>Terjadi kesalahan saat memuat jadwal.</p>`;
                });
        } else if (user.role === 'Client') {
            fetch("get_trainer_schedule.php")
                .then(response => response.json())
                .then(data => {
                    const user = getLoggedInUser();
                    if (data.success) {
                        const schedules = data.schedules;
                        if (schedules.length === 0) {
                            if (user && user.trainer && user.trainer.fullName) {
                                contentContainer.innerHTML = `
                                    <div class="scheduleno2-section">
                                        <h2>Jadwal Latihan</h2>
                                        <p>Anda belum memiliki jadwal latihan, silakan hubungi trainer anda untuk menambahkan jadwal latihan.</p>
                                        <button class="action-btn" onclick="contactTrainer('${user.trainer.fullName}')">Hubungi Trainer (${user.trainer.fullName})</button>
                                    </div>`;
                            } else {
                                contentContainer.innerHTML = `
                                    <div class="scheduleno2-section">
                                        <h2>Jadwal Latihan</h2>
                                        <p>Anda belum memiliki trainer atau trainer Anda belum menambahkan jadwal.</p>
                                        <button class="action-btn" onclick="navigate('trainer')">Pilih Trainer Anda</button>
                                    </div>`;
                            }
                            return;
                        }

                        let scheduleHtml = `
                            <div class="schedule-section">
                                <h2>Jadwal Latihan Dari Trainer Anda</h2>
                                <table class="schedule-table">
                                    <thead>
                                        <tr>
                                            <th>Hari</th>
                                            <th>Waktu Mulai</th>
                                            <th>Waktu Selesai</th>
                                            <th>Aktivitas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                        `;

                        schedules.forEach(sch => {
                            scheduleHtml += `
                                <tr>
                                    <td>${sch.day}</td>
                                    <td>${sch.time_start}</td>
                                    <td>${sch.time_end}</td>
                                    <td>${sch.activity}</td>
                                </tr>`;
                        });
                        scheduleHtml += `</tbody></table></div>`;
                        contentContainer.innerHTML = scheduleHtml;
                    } else {
                        contentContainer.innerHTML = `<p>${data.message || 'Gagal memuat jadwal.'}</p>`;
                    }
                })
                .catch(error => {
                    console.error(error);
                    contentContainer.innerHTML = `<p>Terjadi kesalahan saat memuat jadwal.</p>`;
                });
        } else {
            contentContainer.innerHTML = `<p>Tidak ada jadwal yang dapat ditampilkan untuk peran Anda.</p>`;
        }
    }

    window.contactTrainer = function(trainerName) {
        const user = getLoggedInUser();
        if (user && user.trainer && user.trainer.id) {
            fetch('get_users.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.users) {
                        const trainer = data.users.find(u => u.id === user.trainer.id && u.role === 'Trainer');
                        if (trainer && trainer.contact) {
                            window.open(`https://wa.me/${trainer.contact}`, '_blank');
                        } else {
                            alert('Kontak trainer tidak ditemukan.');
                        }
                    } else {
                        alert('Gagal mendapatkan data trainer.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Terjadi kesalahan saat mendapatkan data trainer.');
                });
        } else {
            alert('Anda belum memiliki trainer.');
        }
    };

    // Fungsi untuk Render Halaman Tentang
    function renderAboutPage() {
        contentContainer.innerHTML = 
            `<!-- About, Contact, and Feedback Section -->
            <div class="about-contact-feedback-section">
                <!-- Gambar di atas Tentang Kami -->
                <div class="about-section">
                    <img src="PIC/us.png" alt="Tentang Kami" class="about-image">
                    <h2>Tentang TrainUp</h2>
                    <p>Kami percaya bahwa kebugaran adalah hak setiap orang, dan kami berkomitmen untuk menyediakan layanan terbaik
                       dengan pendekatan yang ramah dan profesional. Bergabunglah bersama kami di TrainUp, dan capai versi terbaik 
                       dari diri Anda!</p>
                    <p>TrainUp berdiri dengan tujuan membantu masyarakat mencapai kebugaran dan kesehatan melalui layanan
                       pelatihan yang profesional dan terjangkau. Tim kami terdiri dari trainer yang berpengalaman dan berdedikasi 
                       untuk mendampingi Anda dalam setiap langkah perjalanan fitness Anda.</p>
                </div>

                <!-- Kontak dan Saran/Kritik -->
                <div class="contact-feedback-section">
                    <h2>Kontak TrainUp</h2>
                    <div class="contact-info">
                        <div class="contact-item">
                            <img src="PIC/ig.png" alt="Instagram Logo" class="contact-logo">
                            <a href="https://instagram.com/TrainUpCompUA" target="_blank">@TrainUpCompUA</a>
                        </div>
                        <div class="contact-item">
                            <img src="PIC/email.png" alt="Email Logo" class="contact-logo">
                            <a href="mailto:trainupcompua@gmail.com">trainupcompua@gmail.com</a>
                        </div>
                    </div>

                    <h2>Saran dan Kritik</h2>
                    <div class="feedback-form">
                        <form id="feedbackForm" onsubmit="return submitFeedback(event)">
                            <label for="feedback">Masukkan Saran atau Kritik Anda:</label>
                            <textarea id="feedback" name="feedback" rows="5" placeholder="Tulis saran atau kritik Anda di sini..." required></textarea>
                            <button type="submit" class="submit-btn">Kirim</button>
                        </form>
                    </div>
                </div>
            </div>`
        ;
    }

    function renderAdminPage() {
        const user = getLoggedInUser();
        if (!user || user.role !== 'Admin') {
            contentContainer.innerHTML = `<p>Anda tidak memiliki akses ke halaman ini.</p>`;
            return;
        }

        fetch('get_users.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.users) {
                    const clients = data.users.filter(u => u.role === 'Client');
                    const trainers = data.users.filter(u => u.role === 'Trainer');
                    const admins = data.users.filter(u => u.role === 'Admin');

                    contentContainer.innerHTML = 
                        `<div class="admin-section">
                            <h2>Admin Panel</h2>

                            <h3>Clients</h3>
                            <div class="admin-container">
                                ${clients.map(client => 
                                    `<div class="admin-card">
                                        <p><strong>Nama:</strong> ${client.fullName}</p>
                                        <p><strong>Username:</strong> ${client.username}</p>
                                        <p><strong>Email:</strong> ${client.email}</p>
                                        <p><strong>Kontak:</strong> ${client.contact}</p>
                                        <p><strong>Program Capaian:</strong> ${client.programGoals}</p>
                                        <p><strong>Riwayat Penyakit:</strong> ${client.medicalHistory}</p>
                                        <p><strong>Trainer:</strong> ${client.trainer ? client.trainer.fullName : 'Belum memilih trainer'}</p>
                                    </div>`
                                ).join('') || '<p>Belum ada client yang terdaftar.</p>'}
                            </div>

                            <h3>Trainers</h3>
                            <div class="admin-container">
                                ${trainers.map(trainer => 
                                    `<div class="admin-card">
                                        <p><strong>Nama:</strong> ${trainer.fullName}</p>
                                        <p><strong>Username:</strong> ${trainer.username}</p>
                                        <p><strong>Email:</strong> ${trainer.email}</p>
                                        <p><strong>Kontak:</strong> ${trainer.contact}</p>
                                        <p><strong>Spesialisasi:</strong> ${trainer.specialization}</p>
                                        <p><strong>Pengalaman:</strong> ${trainer.experience} tahun</p>
                                        <p><strong>Deskripsi:</strong> ${trainer.description}</p>
                                    </div>`
                                ).join('') || '<p>Belum ada trainer yang terdaftar.</p>'}
                            </div>

                            <h3>Admins</h3>
                            <div class="admin-container">
                                ${admins.map(admin => 
                                    `<div class="admin-card">
                                        <p><strong>Nama:</strong> ${admin.fullName}</p>
                                        <p><strong>Username:</strong> ${admin.username}</p>
                                        <p><strong>Email:</strong> ${admin.email}</p>
                                        <p><strong>Kontak:</strong> ${admin.contact}</p>
                                        <p><strong>Program Capaian:</strong> ${admin.programGoals}</p>
                                        <p><strong>Riwayat Penyakit:</strong> ${admin.medicalHistory}</p>
                                        <p><strong>Trainer:</strong> ${admin.trainer ? admin.trainer.fullName : 'Belum memilih trainer'}</p>
                                    </div>`
                                ).join('') || '<p>Belum ada admin yang terdaftar.</p>'}
                            </div>
                        </div>`;
                } else {
                    contentContainer.innerHTML = `<p>Gagal memuat data admin.</p>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                contentContainer.innerHTML = `<p>Terjadi kesalahan saat memuat data admin.</p>`;
            });
    }

    window.confirmPayment = function () {
        const user = getLoggedInUser();
        if (user && user.role === 'Client' && user.trainer) {
            alert('Pembayaran berhasil dikonfirmasi! Trainer telah dipilih.');
            navigate('home');
        } else {
            alert('Terjadi kesalahan saat mengonfirmasi pembayaran.');
        }
    };

    window.openEditModal = function(id, day, time_start, time_end, activity, clientId = null) {
        // Hapus modal edit yang sudah ada (jika ada)
        const existingModal = document.getElementById('editModal');
        if (existingModal) existingModal.remove();
    
        const editModalHtml = `
            <div class="modal" id="editModal">
    <div class="modal-content">
        <span class="close" onclick="closeEditModal()">&times;</span>
        <div class="modal-header">
            <h2>Edit Jadwal</h2>
        </div>
        <div class="modal-body">
            <form onsubmit="return submitEditSchedule(event, ${id}, ${clientId})">
                <label>Hari: ${day}</label><br><br>
                <label>Waktu Mulai (Opsional)</label>
                <input type="time" id="editTimeStart" value="${time_start || ''}"><br>
                
                <label>Waktu Selesai (Opsional)</label>
                <input type="time" id="editTimeEnd" value="${time_end || ''}"><br>
                
                <label>Kegiatan</label>
                <input type="text" id="editActivity" value="${activity || ''}" required><br><br>

                <button type="submit" class="submit-btn">Simpan Perubahan</button>
            </form>
        </div>
    </div>
</div>

        `;
    
        // Sisipkan modal ke dalam body
        document.body.insertAdjacentHTML('beforeend', editModalHtml);
        const modal = document.getElementById('editModal');
        // Tampilkan modal
        modal.style.display = 'flex';
    };
    
    // Fungsi untuk menutup modal
    window.closeEditModal = function() {
        const modal = document.getElementById('editModal');
        if (modal) modal.remove();
    };
    

    window.submitEditSchedule = function(event, id, clientId) {
        event.preventDefault();
        const time_start = document.getElementById('editTimeStart').value;
        const time_end = document.getElementById('editTimeEnd').value;
        const activity = document.getElementById('editActivity').value;

        fetch('edit_trainer_schedule.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, day: null, time_start, time_end, activity })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Jadwal berhasil diubah.');
                closeEditModal();
                if (clientId) {
                    renderClientSchedulePage(clientId);
                } else {
                    renderSchedulePage();
                }
            } else {
                alert('Gagal mengubah jadwal: ' + data.message);
            }
        })
        .catch(error => {
            console.error(error);
            alert('Terjadi kesalahan saat mengubah jadwal.');
        });

        return false;
    };

    const daysOfWeek = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

    window.openAddModalClient = function (clientId) {
        if (document.getElementById("addModal")) {
            document.getElementById("addModal").remove();
        }

        let rows = '';
        daysOfWeek.forEach(day => {
            rows += `
                <tr>
                    <td><input type="checkbox" class="day-check" data-day="${day}"></td>
                    <td>${day}</td>
                    <td>
                        <input type="time" class="time-start" disabled>
                        -
                        <input type="time" class="time-end" disabled>
                    </td>
                    <td><input type="text" class="activity" placeholder="Aktivitas" disabled></td>
                </tr>
            `;
        });

        const addModal = document.createElement("div");
        addModal.id = "addModal";
        addModal.className = "modal";
        addModal.innerHTML = 
            `<div class="modal-content">
                <span class="close" onclick="closeAddModal()">&times;</span>
                <div class="modal-header">
                    <h2>Tambah Jadwal Latihan</h2>
                    <p>Pilih hari yang ingin ditambahkan jadwalnya. Anda dapat memilih beberapa hari sekaligus.</p>
                </div>
                <div class="modal-body">
                    <form id="addForm" onsubmit="return submitAddClient(event, ${clientId})">
                        <table class="schedule-template-table">
                            <thead>
                                <tr>
                                    <th>Pilih</th>
                                    <th>Hari</th>
                                    <th>Waktu</th>
                                    <th>Aktivitas</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                        <button type="submit" class="submit-btn">Tambahkan Jadwal</button>
                    </form>
                </div>
            </div>`;
        document.body.appendChild(addModal);
        addModal.style.display = "flex";

        document.querySelectorAll('#addModal .day-check').forEach(check => {
            check.addEventListener('change', (e) => {
                const row = e.target.closest('tr');
                const timeStart = row.querySelector('.time-start');
                const timeEnd = row.querySelector('.time-end');
                const activity = row.querySelector('.activity');

                if (e.target.checked) {
                    timeStart.disabled = false;
                    timeEnd.disabled = false;
                    activity.disabled = false;
                } else {
                    timeStart.disabled = true;
                    timeEnd.disabled = true;
                    activity.disabled = true;
                    timeStart.value = '';
                    timeEnd.value = '';
                    activity.value = '';
                }
            });
        });
    };

    window.closeAddModal = function () {
        const addModal = document.getElementById("addModal");
        if (addModal) {
            addModal.style.display = "none";
        }
    };

    window.submitAddClient = function (event, clientId) {
        event.preventDefault();
        const user = getLoggedInUser();
        if (!user || user.role !== 'Trainer') {
            alert('Hanya trainer yang dapat menambahkan jadwal.');
            return false;
        }

        const rows = document.querySelectorAll('#addModal .schedule-template-table tbody tr');
        const promises = [];

        rows.forEach(row => {
            const check = row.querySelector('.day-check');
            if (check.checked) {
                const day = check.getAttribute('data-day');
                const time_start = row.querySelector('.time-start').value.trim();
                const time_end = row.querySelector('.time-end').value.trim();
                const activity = row.querySelector('.activity').value.trim();

                const promise = fetch('add_trainer_schedule.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client_id: clientId, day, time_start, time_end, activity })
                })
                .then(response => response.json());

                promises.push(promise);
            }
        });

        if (promises.length === 0) {
            alert('Tidak ada hari yang dipilih atau data belum lengkap.');
            return false;
        }

        Promise.all(promises)
        .then(results => {
            const failed = results.find(r => !r.success);
            if (!failed) {
                alert('Jadwal berhasil ditambahkan.');
                closeAddModal();
                renderClientSchedulePage(clientId);
            } else {
                alert('Beberapa jadwal gagal ditambahkan. Periksa kembali data Anda.');
            }
        })
        .catch(error => {
            console.error(error);
            alert('Terjadi kesalahan saat menambahkan jadwal.');
        });

        return false;
    };

    window.handleConsultation = function () {
        navigate('consultation');
    };

    window.redirectToConsultation = function () {
        const user = getLoggedInUser();
        if (user && user.trainer) {
            fetch('get_users.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.users) {
                        const trainer = data.users.find(u => u.id === user.trainer.id && u.role === 'Trainer');
                        if (trainer && trainer.contact) {
                            window.open(`https://wa.me/${trainer.contact}`, '_blank');
                            navigate('home');
                        } else {
                            alert('Kontak trainer tidak ditemukan.');
                        }
                    } else {
                        alert('Gagal mendapatkan data trainer.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Terjadi kesalahan saat mendapatkan data trainer.');
                });
        } else {
            alert('Anda belum memiliki trainer.');
        }
    };

    window.toggleSidebar = function () {
        const sidebar = document.getElementById('sidebarDashboard');
        const container = document.querySelector('.container');
        if (sidebar) {
            sidebar.classList.toggle('active');
            container.classList.toggle('shifted');
            if (sidebar.classList.contains('active')) {
                populateDashboard();
            }
        }
    };

    window.updateDashboard = function (event) {
        event.preventDefault();
        const user = getLoggedInUser();
        if (user) {
            const contact = document.getElementById('dashboardContact').value.trim();
            const programGoals = document.getElementById('dashboardProgramGoals').value.trim();
            const medicalHistory = document.getElementById('dashboardMedicalHistory').value.trim();
            const description = document.getElementById('trainerDescription') ? document.getElementById('trainerDescription').value.trim() : null;

            user.contact = contact;
            user.programGoals = programGoals;
            user.medicalHistory = medicalHistory;

            if (user.role === 'Trainer') {
                user.description = description;
            }

            sessionStorage.setItem('user', encryptData(user));

            fetch('update_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Informasi berhasil diperbarui!');
                    renderNavbar();
                    toggleSidebar();
                    navigate('home');
                } else {
                    alert(`Gagal memperbarui informasi: ${result.message}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat memperbarui informasi.');
            });
        }
    };

    function populateDashboard() {
        const user = getLoggedInUser();
        if (user) {
            document.getElementById('dashboardFullName').value = user.fullName;
            document.getElementById('dashboardUsername').value = user.username;
            document.getElementById('dashboardGender').value = user.gender;
            document.getElementById('dashboardEmail').value = user.email;
            document.getElementById('dashboardContact').value = user.contact;
            document.getElementById('dashboardProgramGoals').value = user.programGoals;
            document.getElementById('dashboardMedicalHistory').value = user.medicalHistory;

            if (user.role === 'Trainer') {
                document.getElementById('trainerSection').innerHTML = 
                    `<p>Deskripsi Trainer Anda:</p>
                    <textarea id="trainerDescription" name="description" rows="4" required>${user.description || 'Deskripsi Trainer Anda belum diisi.'}</textarea>`;
            } else if (user.role === 'Client') {
                if (user.trainer && user.trainer.fullName) {
                    document.getElementById('trainerSection').innerHTML = 
                        `<p>Trainer Anda Sekarang: ${user.trainer.fullName}</p>
                        <button type="button" class="btn-update" onclick="handleConsultation()">Konsultasi Sekarang</button>
                        <button type="button" class="btn-update" onclick="removeTrainer()">Hapus Trainer</button>`;
                } else {
                    document.getElementById('trainerSection').innerHTML = 
                        `<p>Anda belum memiliki trainer.</p>
                        <button type="button" class="btn-update" onclick="navigate('trainer')">Pilih Trainer Anda</button>`;
                }
            }
        }
    }

    window.submitFeedback = function (event) {
        event.preventDefault();
        const feedback = document.getElementById("feedback").value.trim();

        fetch('save_feedback.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `feedback=${encodeURIComponent(feedback)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const feedbackSection = document.querySelector(".feedback-form");
                feedbackSection.innerHTML = 
                    `<div class="feedback-success">
                        <p>Kritik dan Saran Anda telah berhasil dikirimkan. Terima kasih!</p>
                    </div>`;
            } else {
                alert(`Terjadi kesalahan saat mengirim feedback: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat mengirim feedback. Silakan coba lagi.');
        });

        return false;
    };

    window.onclick = function(event) {
        const sidebar = document.getElementById("sidebarDashboard");
        const profilBtn = document.querySelector('.profil-toggle-btn');
        if (sidebar && !sidebar.contains(event.target) && event.target !== profilBtn && (!profilBtn || !profilBtn.contains(event.target))) {
            sidebar.classList.remove('active');
            document.querySelector('.container').classList.remove('shifted');
        }
    };

    window.initiatePayment = function (trainerId, trainerName) {
        const user = getLoggedInUser();
        if (user && user.role === "Client") {
            user.trainer = { id: trainerId, fullName: trainerName };
            sessionStorage.setItem("user", encryptData(user));
    
            fetch("update_user.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ trainer_id: trainerId }),
            })
            .then((response) => response.json())
            .then((result) => {
                if (result.success) {
                    navigate("payment");
                } else {
                    alert(`Gagal memilih trainer: ${result.message}`);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Terjadi kesalahan saat memilih trainer.");
            });
        } else {
            promptLogin();
        }
    };

    function promptLogin() {
        const shouldLogin = confirm("Anda belum login. Apakah Anda ingin login sekarang?");
        if (shouldLogin) {
            sessionStorage.setItem("redirectTo", "trainer");
            window.location.href = "login.html";
        }
    }

    window.removeTrainer = function() {
        const user = getLoggedInUser();
        if (user && user.role === 'Client' && user.trainer) {
            if (confirm(`Apakah Anda yakin ingin menghapus trainer: ${user.trainer.fullName}?`)) {
                user.trainer = null;
                sessionStorage.setItem('user', encryptData(user));

                fetch('update_user.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ trainer_id: null })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        alert('Trainer berhasil dihapus.');
                        renderNavbar();
                        toggleSidebar();
                        navigate('home');
                    } else {
                        alert(`Gagal menghapus trainer: ${result.message}`);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Terjadi kesalahan saat menghapus trainer.');
                });
            }
        } else {
            alert('Anda tidak memiliki trainer yang dapat dihapus.');
        }
    };

    // Fungsi Hapus Jadwal
    window.hapusJadwal = function (scheduleId, clientId) {
        if(confirm('Apakah anda yakin ingin menghapus jadwal ini?')) {
            fetch('hapus_jadwal.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedule_id: scheduleId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Jadwal berhasil dihapus.');
                    renderClientSchedulePage(clientId);
                } else {
                    alert('Gagal menghapus jadwal: ' + data.message);
                }
            })
            .catch(error => {
                console.error(error);
                alert('Terjadi kesalahan saat menghapus jadwal.');
            });
        }
    };

    // Fungsi Hapus Semua Jadwal
    window.hapusSemuaJadwal = function (clientId) {
        if(confirm('Apakah anda yakin ingin menghapus semua jadwal untuk client ini?')) {
            fetch('hapus_semua_jadwal.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: clientId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Semua jadwal berhasil dihapus.');
                    renderClientSchedulePage(clientId);
                } else {
                    alert('Gagal menghapus semua jadwal: ' + data.message);
                }
            })
            .catch(error => {
                console.error(error);
                alert('Terjadi kesalahan saat menghapus semua jadwal.');
            });
        }
    };

    verifySession().then(() => {
        renderNavbar();
        navigate("home");
    });

    document.addEventListener("DOMContentLoaded", () => {
        const navigateTarget = localStorage.getItem('navigate');
        if (navigateTarget) {
            navigate(navigateTarget);
            localStorage.removeItem('navigate');
        }
    });
});
