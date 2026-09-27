/**
 * Integrated Public Healthcare Platform
 * Core Application Logic, Router, Offline Engine, Triage & Interactivity
 */

// Application State
const AppState = {
    currentPage: "landing",
    isOnline: true,
    user: null,
    selectedRole: "patient",
    selectedSymptoms: new Set(),
    triageResult: null,
    queue: {
        tokenNumber: 12,
        currentServing: 9,
        estimatedWait: 10,
        timerInterval: null
    },
    teleconsult: {
        inCall: false,
        micMuted: false,
        videoMuted: false,
        callSeconds: 0,
        callTimer: null,
        messages: [
            { sender: "doctor", text: "Namaste Ramesh ji. I can see you reported fever and cough for 3 days. Are you experiencing any breathing tightness?", time: "10:32 AM" },
            { sender: "patient", text: "Namaste Doctor. No chest tightness, but body ache and fever feel worse in the evening.", time: "10:33 AM" },
            { sender: "doctor", text: "Understood. Please keep drinking boiled water and ORS. I have updated your digital prescription with Paracetamol and Cetirizine.", time: "10:34 AM" }
        ]
    },
    syncStatus: {
        isSyncing: false,
        lastSynced: "Just now",
        pendingCount: 2
    }
};

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // 1. Initialize user from LocalStorage or default
    initUserData();

    // 2. Setup Network Status listeners & offline simulation
    initNetworkMonitoring();

    // 3. Setup Navigation & Routing
    initNavigation();

    // 4. Render initial dynamic components
    renderRoleCards();
    renderSymptomsGrid();
    renderFacilitiesList();
    renderMedicinesList();
    renderDiagnosticsList();
    renderRemindersList();
    renderHealthRecord();
    renderOfflineQueue();
    updateDashboardUI();

    // 5. Setup Form Validations and Event Handlers
    initFormHandlers();

    // 6. Handle URL Hash if present
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
}

// -------------------------------------------------------------
// USER DATA & LOCAL STORAGE
// -------------------------------------------------------------
function initUserData() {
    const savedUser = localStorage.getItem("healthcare_user");
    if (savedUser) {
        AppState.user = JSON.parse(savedUser);
    } else {
        AppState.user = Object.assign({}, HealthcareData.currentUser);
        localStorage.setItem("healthcare_user", JSON.stringify(AppState.user));
    }

    // Initialize offline registrations if not present
    if (!localStorage.getItem("healthcare_offline_queue")) {
        localStorage.setItem("healthcare_offline_queue", JSON.stringify(HealthcareData.defaultOfflineRegistrations));
    }
    updatePendingBadge();
}

function updatePendingBadge() {
    try {
        const queue = JSON.parse(localStorage.getItem("healthcare_offline_queue") || "[]");
        AppState.syncStatus.pendingCount = queue.length;
        const badges = document.querySelectorAll(".pending-sync-count");
        badges.forEach(b => {
            b.textContent = queue.length;
            b.style.display = queue.length > 0 ? "inline-flex" : "none";
        });
    } catch (e) {
        console.error("Error reading offline queue", e);
    }
}

// -------------------------------------------------------------
// NAVIGATION & ROUTER
// -------------------------------------------------------------
function initNavigation() {
    // Nav links
    document.querySelectorAll("[data-nav-target]").forEach(element => {
        element.addEventListener("click", (e) => {
            e.preventDefault();
            const target = element.getAttribute("data-nav-target");
            navigateTo(target);
        });
    });

    // Close mobile navbar on click
    const navCollapse = document.getElementById("navbarHealthcareContent");
    if (navCollapse) {
        document.querySelectorAll("#navbarHealthcareContent .nav-link-custom").forEach(link => {
            link.addEventListener("click", () => {
                const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                if (bsCollapse) bsCollapse.hide();
            });
        });
    }
}

function navigateTo(pageId) {
    if (!pageId) return;

    // Check if element exists
    const targetSection = document.getElementById(`page-${pageId}`);
    if (!targetSection) {
        console.warn(`Section #page-${pageId} not found`);
        return;
    }

    // Hide all pages
    document.querySelectorAll(".page-section").forEach(sec => {
        sec.classList.remove("active-page");
    });

    // Show target page
    targetSection.classList.add("active-page");
    AppState.currentPage = pageId;

    // Update active nav links
    document.querySelectorAll(".nav-link-custom").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("data-nav-target") === pageId) {
            link.classList.add("active");
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update browser hash silently
    if (window.location.hash !== `#${pageId}`) {
        history.pushState(null, null, `#${pageId}`);
    }

    // Trigger page-specific hooks
    onPageEntered(pageId);
}

function handleHashChange() {
    const hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById(`page-${hash}`)) {
        navigateTo(hash);
    } else {
        navigateTo("landing");
    }
}

function onPageEntered(pageId) {
    if (pageId === "dashboard") {
        updateDashboardUI();
    } else if (pageId === "queue-teleconsult") {
        startQueueLiveSimulation();
    } else if (pageId === "profile") {
        renderProfilePage();
    } else if (pageId === "offline-mode") {
        renderOfflineQueue();
    } else if (pageId === "sync-process") {
        renderSyncStatusOverview();
    }
}

// -------------------------------------------------------------
// NETWORK MONITORING & OFFLINE SIMULATION
// -------------------------------------------------------------
function initNetworkMonitoring() {
    // Real window online/offline events
    window.addEventListener("online", () => updateNetworkStatus(true));
    window.addEventListener("offline", () => updateNetworkStatus(false));

    // Offline simulation toggle button
    const toggleBtn = document.getElementById("btnToggleNetworkMode");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            AppState.isOnline = !AppState.isOnline;
            updateNetworkStatus(AppState.isOnline, true);
        });
    }

    // Set initial
    updateNetworkStatus(navigator.onLine);
}

function updateNetworkStatus(isOnline, isManualSimulated = false) {
    AppState.isOnline = isOnline;
    const pill = document.getElementById("networkStatusPill");
    const label = document.getElementById("networkStatusLabel");
    const toggleBtn = document.getElementById("btnToggleNetworkMode");
    const offlineNotice = document.getElementById("offlineBannerNotice");

    if (isOnline) {
        if (pill) {
            pill.className = "network-pill online";
            label.textContent = "Online • Health Grid Connected";
        }
        if (toggleBtn) {
            toggleBtn.innerHTML = `<i class="bi bi-wifi-off me-1"></i> Simulate Offline`;
            toggleBtn.className = "btn btn-sm btn-outline-light";
        }
        if (offlineNotice) offlineNotice.style.display = "none";
        showToast("Network Connected", "Connected to the National Integrated Health Grid.", "success");
    } else {
        if (pill) {
            pill.className = "network-pill offline";
            label.textContent = "Offline Mode • Data Saved Locally";
        }
        if (toggleBtn) {
            toggleBtn.innerHTML = `<i class="bi bi-wifi me-1"></i> Switch Online`;
            toggleBtn.className = "btn btn-sm btn-warning text-dark font-weight-bold";
        }
        if (offlineNotice) offlineNotice.style.display = "block";
        showToast("Offline Mode Active", "Working seamlessly without internet. Patient data will save to LocalStorage.", "warning");
    }
}

// -------------------------------------------------------------
// 1. LANDING PAGE & STATS
// -------------------------------------------------------------
// Get Started button navigates to login
// Quick actions navigate directly

// -------------------------------------------------------------
// 2. LOGIN / REGISTER & FORM VALIDATION
// -------------------------------------------------------------
function initFormHandlers() {
    // Login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const identifier = document.getElementById("loginIdentifier").value.trim();
            const password = document.getElementById("loginPassword").value;

            if (!identifier) {
                showToast("Validation Error", "Please enter your Mobile Number or Health ID.", "warning");
                return;
            }
            if (password.length < 4) {
                showToast("Validation Error", "Password must be at least 4 characters.", "warning");
                return;
            }

            // Simulating login success
            showToast("Login Successful", `Welcome back, ${AppState.user.name}!`, "success");
            navigateTo("role-selection");
        });
    }

    // Register form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("regName").value.trim();
            const mobile = document.getElementById("regMobile").value.trim();
            const password = document.getElementById("regPassword").value;

            if (!name) {
                showToast("Validation Error", "Please enter your full name.", "warning");
                return;
            }
            if (!/^\d{10}$/.test(mobile.replace(/\D/g, ""))) {
                showToast("Validation Error", "Please enter a valid 10-digit mobile number.", "warning");
                return;
            }
            if (password.length < 4) {
                showToast("Validation Error", "Password must be at least 4 characters.", "warning");
                return;
            }

            // Update user profile
            AppState.user.name = name;
            AppState.user.phone = "+91 " + mobile.slice(-10);
            localStorage.setItem("healthcare_user", JSON.stringify(AppState.user));

            showToast("Registration Successful", `Account created for ${name}. Select your role to continue.`, "success");
            navigateTo("role-selection");
        });
    }

    // One-click demo login buttons
    document.querySelectorAll(".btn-demo-login").forEach(btn => {
        btn.addEventListener("click", () => {
            const role = btn.getAttribute("data-role");
            selectRole(role);
            showToast("Demo Sign-In", `Signed in as ${role.toUpperCase()}.`, "success");
            navigateTo("dashboard");
        });
    });

    // Profile edit form
    const editProfileForm = document.getElementById("editProfileForm");
    if (editProfileForm) {
        editProfileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            AppState.user.name = document.getElementById("editName").value.trim() || AppState.user.name;
            AppState.user.age = parseInt(document.getElementById("editAge").value) || AppState.user.age;
            AppState.user.gender = document.getElementById("editGender").value || AppState.user.gender;
            AppState.user.phone = document.getElementById("editPhone").value.trim() || AppState.user.phone;
            AppState.user.address = document.getElementById("editAddress").value.trim() || AppState.user.address;
            AppState.user.bloodGroup = document.getElementById("editBlood").value || AppState.user.bloodGroup;

            localStorage.setItem("healthcare_user", JSON.stringify(AppState.user));
            updateDashboardUI();
            renderProfilePage();

            // Hide modal
            const modalEl = document.getElementById("editProfileModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            showToast("Profile Updated", "Patient profile saved successfully.", "success");
        });
    }

    // Offline registration form
    const offlineRegForm = document.getElementById("offlineRegistrationForm");
    if (offlineRegForm) {
        offlineRegForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("offPatientName").value.trim();
            const age = document.getElementById("offPatientAge").value.trim();
            const gender = document.getElementById("offPatientGender").value;
            const village = document.getElementById("offPatientVillage").value.trim();
            const symptoms = document.getElementById("offPatientSymptoms").value.trim();
            const priority = document.getElementById("offPatientPriority").value;

            if (!name || !age || !village || !symptoms) {
                showToast("Required Fields Missing", "Please complete all fields for the offline registration.", "warning");
                return;
            }

            const newRecord = {
                id: "OFF-" + Math.floor(100 + Math.random() * 900),
                name: name,
                age: age,
                gender: gender,
                village: village,
                symptoms: symptoms,
                priority: priority,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", Today",
                syncStatus: "Pending Sync"
            };

            // Save to LocalStorage queue
            const queue = JSON.parse(localStorage.getItem("healthcare_offline_queue") || "[]");
            queue.unshift(newRecord);
            localStorage.setItem("healthcare_offline_queue", JSON.stringify(queue));

            offlineRegForm.reset();
            updatePendingBadge();
            renderOfflineQueue();

            showToast("Saved Locally", `Patient "${name}" record stored securely in browser LocalStorage. Ready to sync when online.`, "success");
        });
    }

    // Appointment Booking Form
    const bookAptForm = document.getElementById("bookAppointmentForm");
    if (bookAptForm) {
        bookAptForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const facility = document.getElementById("bookFacilityName").value;
            const dept = document.getElementById("bookDepartment").value;
            const date = document.getElementById("bookDate").value;
            const time = document.getElementById("bookTime").value;

            // Generate token
            const newToken = "Token No. " + (Math.floor(Math.random() * 15) + 10);
            AppState.queue.tokenNumber = parseInt(newToken.replace(/\D/g, "")) || 14;
            AppState.queue.currentServing = AppState.queue.tokenNumber - 3;
            AppState.currentAppointment.tokenNumber = newToken;
            AppState.currentAppointment.facilityName = facility;
            AppState.currentAppointment.time = time;
            AppState.currentAppointment.date = date;

            const modalEl = document.getElementById("bookAppointmentModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            showToast("Appointment Booked!", `${newToken} allocated for ${facility}.`, "success");
            navigateTo("queue-teleconsult");
        });
    }

    // Teleconsult Chat Form
    const chatForm = document.getElementById("teleconsultChatForm");
    if (chatForm) {
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = document.getElementById("teleconsultInput");
            const text = input.value.trim();
            if (!text) return;

            addChatMessage("patient", text);
            input.value = "";

            // Simulate doctor auto-reply after 1.5s
            setTimeout(() => {
                const doctorReplies = [
                    "Noted. I am noting this down in your central health record.",
                    "Please avoid cold liquids and make sure to measure your temperature morning and night.",
                    "If temperature goes over 102°F or breathlessness develops, visit the CHC emergency right away.",
                    "The prescription has been dispatched to Rampur PHC Pharmacy for your free collection."
                ];
                const reply = doctorReplies[Math.floor(Math.random() * doctorReplies.length)];
                addChatMessage("doctor", reply);
            }, 1400);
        });
    }
}

// -------------------------------------------------------------
// 3. ROLE SELECTION
// -------------------------------------------------------------
function renderRoleCards() {
    const container = document.getElementById("roleCardsContainer");
    if (!container) return;

    container.innerHTML = HealthcareData.roles.map(role => `
        <div class="col-md-6 col-lg-3">
            <div class="role-card ${AppState.selectedRole === role.id ? 'active' : ''}" 
                 onclick="selectRole('${role.id}')">
                <div class="role-icon-box">
                    <i class="bi ${role.icon}"></i>
                </div>
                <h4 class="mb-1 text-dark-green">${role.name}</h4>
                <div class="badge bg-light-green text-primary-green border border-light-green mb-2">${role.badge}</div>
                <p class="small text-muted mb-3 flex-grow-1">${role.description}</p>
                <button class="btn btn-sm ${AppState.selectedRole === role.id ? 'btn-green-primary' : 'btn-green-outline'} w-100 mt-auto">
                    ${AppState.selectedRole === role.id ? '<i class="bi bi-check2-circle me-1"></i> Active Role' : 'Select Role'}
                </button>
            </div>
        </div>
    `).join("");
}

function selectRole(roleId) {
    AppState.selectedRole = roleId;
    const roleObj = HealthcareData.roles.find(r => r.id === roleId);
    if (roleObj) {
        AppState.user.role = roleObj.name;
        AppState.user.roleTitle = roleObj.subtitle;
        if (roleId === "doctor") {
            AppState.user.name = "Dr. Ramesh Sharma";
        } else if (roleId === "health_worker") {
            AppState.user.name = "Pooja Devi (ASHA)";
        } else if (roleId === "health_partner") {
            AppState.user.name = "Jan Aushadhi Partner";
        } else {
            AppState.user.name = "Ramesh Kumar";
        }
        localStorage.setItem("healthcare_user", JSON.stringify(AppState.user));
    }
    renderRoleCards();
    updateDashboardUI();
    showToast("Role Switched", `Now viewing as ${AppState.user.role} (${AppState.user.name})`, "success");
}

// -------------------------------------------------------------
// 4. HOME DASHBOARD
// -------------------------------------------------------------
function updateDashboardUI() {
    // Update Greeting
    const greetingEl = document.getElementById("dashboardGreeting");
    if (greetingEl) {
        greetingEl.innerHTML = `Good Morning, <span class="text-primary-green">${AppState.user.name}</span>`;
    }

    // Role badge
    const roleBadge = document.getElementById("dashboardRoleBadge");
    if (roleBadge) {
        roleBadge.textContent = AppState.user.role;
    }

    // Navbar user info
    const navUser = document.getElementById("navCurrentUserName");
    if (navUser) {
        navUser.textContent = AppState.user.name;
    }
}

// -------------------------------------------------------------
// 5. PATIENT PROFILE
// -------------------------------------------------------------
function renderProfilePage() {
    const profile = AppState.user;
    const fields = [
        { label: "Full Name", val: profile.name },
        { label: "Age & Gender", val: `${profile.age} Years • ${profile.gender}` },
        { label: "Mobile Number", val: profile.phone },
        { label: "ABHA / Health ID", val: profile.healthId },
        { label: "Blood Group", val: profile.bloodGroup },
        { label: "Registered Address", val: profile.address },
        { label: "Emergency Contact", val: profile.emergencyContact },
        { label: "Allergies / Flags", val: profile.allergies }
    ];

    const container = document.getElementById("profileDetailsContainer");
    if (container) {
        container.innerHTML = fields.map(f => `
            <div class="col-md-6 mb-3">
                <div class="p-3 bg-light rounded-3 border">
                    <span class="text-muted d-block small font-weight-bold text-uppercase">${f.label}</span>
                    <span class="fw-semibold text-dark-green fs-6">${f.val}</span>
                </div>
            </div>
        `).join("");
    }

    // Pre-fill edit modal inputs
    if (document.getElementById("editName")) {
        document.getElementById("editName").value = profile.name;
        document.getElementById("editAge").value = profile.age;
        document.getElementById("editGender").value = profile.gender;
        document.getElementById("editPhone").value = profile.phone;
        document.getElementById("editAddress").value = profile.address;
        document.getElementById("editBlood").value = profile.bloodGroup;
    }
}

// -------------------------------------------------------------
// 6. DESCRIBE SYMPTOMS
// -------------------------------------------------------------
function renderSymptomsGrid() {
    const container = document.getElementById("symptomsGrid");
    if (!container) return;

    container.innerHTML = HealthcareData.symptoms.map(s => {
        const isSelected = AppState.selectedSymptoms.has(s.id);
        return `
            <div class="col-sm-6 col-md-4">
                <div class="symptom-card ${isSelected ? 'selected' : ''}" 
                     id="symptom-${s.id}"
                     onclick="toggleSymptom('${s.id}')">
                    <div class="symptom-icon">
                        <i class="bi ${s.icon}"></i>
                    </div>
                    <div class="flex-grow-1">
                        <h5 class="mb-0 fs-6 text-dark-green">${s.name}</h5>
                        <p class="small text-muted mb-0">${s.desc}</p>
                    </div>
                    <div>
                        <i class="bi ${isSelected ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'} fs-5"></i>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    updateSymptomSummary();
}

function toggleSymptom(symptomId) {
    if (AppState.selectedSymptoms.has(symptomId)) {
        AppState.selectedSymptoms.delete(symptomId);
    } else {
        AppState.selectedSymptoms.add(symptomId);
    }
    renderSymptomsGrid();
}

function updateSymptomSummary() {
    const count = AppState.selectedSymptoms.size;
    const badge = document.getElementById("symptomsSelectedCount");
    const nextBtn = document.getElementById("btnProceedTriage");
    if (badge) badge.textContent = `${count} Selected`;
    if (nextBtn) {
        if (count === 0) {
            nextBtn.classList.add("disabled");
        } else {
            nextBtn.classList.remove("disabled");
        }
    }
}

function filterSymptoms(query) {
    const q = query.toLowerCase();
    document.querySelectorAll(".symptom-card").forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(q)) {
            card.parentElement.style.display = "block";
        } else {
            card.parentElement.style.display = "none";
        }
    });
}

function proceedToDigitalTriage() {
    if (AppState.selectedSymptoms.size === 0) {
        showToast("Select Symptoms", "Please pick at least one symptom to proceed with triage.", "warning");
        return;
    }
    computeDigitalTriage();
    navigateTo("triage");
}

// -------------------------------------------------------------
// 7. DIGITAL TRIAGE
// -------------------------------------------------------------
function computeDigitalTriage() {
    const selected = Array.from(AppState.selectedSymptoms);
    const hasEmergency = selected.includes("chest_pain") || selected.includes("breathless");
    const hasMedium = selected.includes("fever") || selected.includes("cough") || selected.includes("vomiting");

    let priority = "Medium Priority";
    let badgeClass = "badge-priority-medium";
    let recommendedCare = "Visit PHC / Doctor";
    let advice = "Your reported symptoms indicate an active acute infection or inflammation. Consultation with a medical officer at your nearest Primary Health Centre (PHC) is recommended within 24 hours.";

    if (hasEmergency) {
        priority = "High Priority (Urgent)";
        badgeClass = "badge bg-danger text-white";
        recommendedCare = "Immediate Care / CHC Emergency";
        advice = "Chest discomfort or difficulty breathing requires prompt evaluation. Please proceed immediately to Community Health Centre or call 108 Emergency Ambulance.";
    } else if (!hasMedium) {
        priority = "Low Priority";
        badgeClass = "badge bg-info text-dark";
        recommendedCare = "Teleconsultation / Home Care";
        advice = "Mild symptoms can be managed through teleconsultation and adequate hydration. Book a video call with a PHC doctor.";
    }

    AppState.triageResult = {
        priority,
        badgeClass,
        recommendedCare,
        advice,
        symptoms: selected.map(id => {
            const sym = HealthcareData.symptoms.find(s => s.id === id);
            return sym ? sym.name : id;
        })
    };

    renderTriageView();
}

function renderTriageView() {
    const res = AppState.triageResult;
    if (!res) return;

    const listEl = document.getElementById("triageSymptomsList");
    if (listEl) {
        listEl.innerHTML = res.symptoms.map(s => `
            <span class="badge bg-light text-dark-green border border-light-green p-2 px-3 fs-6 rounded-pill">
                <i class="bi bi-check2 text-success me-1"></i> ${s}
            </span>
        `).join(" ");
    }

    const priorityBadge = document.getElementById("triagePriorityBadge");
    if (priorityBadge) {
        priorityBadge.className = res.badgeClass;
        priorityBadge.textContent = res.priority;
    }

    const careEl = document.getElementById("triageRecommendedCare");
    if (careEl) {
        careEl.textContent = res.recommendedCare;
    }

    const adviceEl = document.getElementById("triageAdviceText");
    if (adviceEl) {
        adviceEl.textContent = res.advice;
    }
}

// -------------------------------------------------------------
// 8. FIND FACILITY & APPOINTMENT
// -------------------------------------------------------------
function renderFacilitiesList(filterType = "all") {
    const container = document.getElementById("facilitiesListContainer");
    if (!container) return;

    const filtered = HealthcareData.facilities.filter(f => {
        if (filterType === "all") return true;
        return f.type.toLowerCase().includes(filterType.toLowerCase());
    });

    container.innerHTML = filtered.map(f => `
        <div class="col-md-6 mb-4">
            <div class="health-card h-100 d-flex flex-direction-column justify-content-between">
                <div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="facility-badge">${f.typeFullName}</span>
                        <span class="badge-available"><i class="bi bi-clock"></i> ${f.availability}</span>
                    </div>
                    <h4 class="text-dark-green mb-1">${f.name}</h4>
                    <p class="text-muted small mb-2"><i class="bi bi-geo-alt-fill text-danger me-1"></i> ${f.distance} • ${f.address}</p>
                    
                    <div class="bg-light-green p-2 rounded-3 mb-3 border border-light-green">
                        <span class="d-block small text-muted font-weight-bold">Available Services:</span>
                        <span class="small fw-semibold text-dark-green">${f.availableService}</span>
                    </div>

                    <div class="d-flex gap-3 small text-secondary mb-3">
                        <span><i class="bi bi-person-badge text-success me-1"></i> <strong>${f.doctorsOnDuty}</strong> Doctors on-duty</span>
                        <span><i class="bi bi-hospital text-success me-1"></i> <strong>${f.beds}</strong> Inpatient Beds</span>
                    </div>
                </div>

                <div class="d-flex gap-2 pt-2 border-top">
                    <button class="btn btn-green-outline btn-sm flex-fill" onclick="viewFacilityDetails('${f.id}')">
                        <i class="bi bi-info-circle me-1"></i> View
                    </button>
                    <button class="btn btn-green-primary btn-sm flex-fill" onclick="openBookModal('${f.name}')">
                        <i class="bi bi-calendar2-plus me-1"></i> Book
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function filterFacilityByType(type, btnEl) {
    document.querySelectorAll(".facility-filter-btn").forEach(b => b.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");
    renderFacilitiesList(type);
}

function viewFacilityDetails(facId) {
    const f = HealthcareData.facilities.find(fac => fac.id === facId);
    if (!f) return;

    const modalBody = document.getElementById("facilityDetailsModalBody");
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="text-center pb-3 border-bottom mb-3">
                <div class="brand-icon-box mx-auto mb-2"><i class="bi bi-hospital"></i></div>
                <h4 class="text-dark-green">${f.name}</h4>
                <span class="badge bg-success-subtle text-success">${f.typeFullName}</span>
            </div>
            <ul class="list-group list-group-flush small mb-3">
                <li class="list-group-item d-flex justify-content-between">
                    <span class="text-muted">Distance:</span>
                    <span class="fw-bold">${f.distance}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span class="text-muted">Timings:</span>
                    <span class="fw-bold">${f.timing}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span class="text-muted">Helpdesk Phone:</span>
                    <span class="fw-bold text-success">${f.phone}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span class="text-muted">Doctors On-Duty:</span>
                    <span class="fw-bold">${f.doctorsOnDuty} Specialists/MO</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span class="text-muted">Citizen Rating:</span>
                    <span class="fw-bold text-warning"><i class="bi bi-star-fill"></i> ${f.rating}</span>
                </li>
            </ul>
            <div class="p-3 bg-light rounded-3">
                <span class="fw-bold d-block mb-1 small text-dark">Services & Equipment:</span>
                <p class="small text-muted mb-0">${f.availableService}. Full digital integration with e-Sanjeevani Teleconsultation and Jan Aushadhi generic pharmacy.</p>
            </div>
        `;
    }
    const modalEl = document.getElementById("facilityDetailsModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function openBookModal(facilityName) {
    const select = document.getElementById("bookFacilityName");
    if (select) {
        select.value = facilityName;
    }
    const modalEl = document.getElementById("bookAppointmentModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// -------------------------------------------------------------
// 9. QUEUE / TELECONSULTATION
// -------------------------------------------------------------
function startQueueLiveSimulation() {
    updateQueueDisplay();

    // Clear any existing timer
    if (AppState.queue.timerInterval) {
        clearInterval(AppState.queue.timerInterval);
    }

    // Dynamic queue ticker
    AppState.queue.timerInterval = setInterval(() => {
        if (AppState.queue.currentServing < AppState.queue.tokenNumber) {
            // Chance to advance queue
            if (Math.random() > 0.65) {
                AppState.queue.currentServing++;
                AppState.queue.estimatedWait = Math.max(2, (AppState.queue.tokenNumber - AppState.queue.currentServing) * 4);
                updateQueueDisplay();
                if (AppState.queue.currentServing === AppState.queue.tokenNumber) {
                    showToast("It's Your Turn!", "Token No. 12 is now being called by Dr. Ramesh Sharma.", "success");
                }
            }
        }
    }, 12000);
}

function advanceQueueManual() {
    if (AppState.queue.currentServing < AppState.queue.tokenNumber) {
        AppState.queue.currentServing++;
        AppState.queue.estimatedWait = Math.max(0, (AppState.queue.tokenNumber - AppState.queue.currentServing) * 3);
        updateQueueDisplay();
        showToast("Queue Advanced", `Now serving Token No. ${AppState.queue.currentServing}`, "info");
    } else {
        showToast("Now Serving You", "You are currently with the doctor.", "success");
    }
}

function updateQueueDisplay() {
    const tokenDisplay = document.getElementById("queueTokenDisplay");
    if (tokenDisplay) {
        tokenDisplay.textContent = `Token No. ${AppState.queue.tokenNumber}`;
    }

    const servingDisplay = document.getElementById("queueServingDisplay");
    if (servingDisplay) {
        servingDisplay.textContent = `Token No. ${AppState.queue.currentServing}`;
    }

    const waitDisplay = document.getElementById("queueWaitDisplay");
    if (waitDisplay) {
        const diff = Math.max(0, AppState.queue.tokenNumber - AppState.queue.currentServing);
        waitDisplay.textContent = `${diff} Patients Ahead • Est. wait ~${AppState.queue.estimatedWait} mins`;
    }
}

function launchTeleconsultation() {
    AppState.teleconsult.inCall = true;
    AppState.teleconsult.callSeconds = 0;

    const modalEl = document.getElementById("teleconsultRoomModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // Call duration timer
    const durationEl = document.getElementById("teleconsultDuration");
    if (AppState.teleconsult.callTimer) clearInterval(AppState.teleconsult.callTimer);
    AppState.teleconsult.callTimer = setInterval(() => {
        AppState.teleconsult.callSeconds++;
        const mins = String(Math.floor(AppState.teleconsult.callSeconds / 60)).padStart(2, "0");
        const secs = String(AppState.teleconsult.callSeconds % 60).padStart(2, "0");
        if (durationEl) durationEl.textContent = `${mins}:${secs}`;
    }, 1000);

    renderChatMessages();
}

function toggleCallMic() {
    AppState.teleconsult.micMuted = !AppState.teleconsult.micMuted;
    const btn = document.getElementById("btnToggleMic");
    if (btn) {
        if (AppState.teleconsult.micMuted) {
            btn.classList.add("active-off");
            btn.innerHTML = `<i class="bi bi-mic-mute-fill"></i>`;
            showToast("Microphone", "Microphone muted.", "info");
        } else {
            btn.classList.remove("active-off");
            btn.innerHTML = `<i class="bi bi-mic-fill"></i>`;
            showToast("Microphone", "Microphone active.", "info");
        }
    }
}

function toggleCallVideo() {
    AppState.teleconsult.videoMuted = !AppState.teleconsult.videoMuted;
    const btn = document.getElementById("btnToggleVideo");
    const feed = document.getElementById("selfVideoFeed");
    if (btn) {
        if (AppState.teleconsult.videoMuted) {
            btn.classList.add("active-off");
            btn.innerHTML = `<i class="bi bi-camera-video-off-fill"></i>`;
            if (feed) feed.style.opacity = "0.2";
            showToast("Camera", "Camera disabled.", "info");
        } else {
            btn.classList.remove("active-off");
            btn.innerHTML = `<i class="bi bi-camera-video-fill"></i>`;
            if (feed) feed.style.opacity = "1";
            showToast("Camera", "Camera enabled.", "info");
        }
    }
}

function endTeleconsultation() {
    AppState.teleconsult.inCall = false;
    if (AppState.teleconsult.callTimer) clearInterval(AppState.teleconsult.callTimer);

    const modalEl = document.getElementById("teleconsultRoomModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    showToast("Consultation Completed", "Dr. Sharma has submitted your digital health record.", "success");
    navigateTo("records");
}

function addChatMessage(sender, text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    AppState.teleconsult.messages.push({ sender, text, time });
    renderChatMessages();
}

function renderChatMessages() {
    const container = document.getElementById("teleconsultChatContainer");
    if (!container) return;

    container.innerHTML = AppState.teleconsult.messages.map(m => `
        <div class="mb-2 d-flex flex-column ${m.sender === 'patient' ? 'align-items-end' : 'align-items-start'}">
            <div class="p-2 px-3 rounded-3 small ${m.sender === 'patient' ? 'bg-success text-white' : 'bg-light text-dark'}" style="max-width: 85%;">
                ${m.text}
            </div>
            <span class="text-muted" style="font-size: 0.65rem;">${m.sender === 'patient' ? 'You' : 'Dr. Sharma'} • ${m.time}</span>
        </div>
    `).join("");

    container.scrollTop = container.scrollHeight;
}

// -------------------------------------------------------------
// 10. CONSULTATION & HEALTH RECORD
// -------------------------------------------------------------
function renderHealthRecord() {
    const rec = HealthcareData.consultationRecord;
    const rxContainer = document.getElementById("recordPrescriptionsContainer");
    if (rxContainer) {
        rxContainer.innerHTML = rec.prescriptions.map(p => `
            <div class="border-bottom pb-2 mb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <strong class="text-dark-green">${p.name}</strong>
                    <span class="badge bg-light-green text-primary-green border border-light-green">${p.duration}</span>
                </div>
                <div class="small text-secondary">${p.dosage}</div>
                <div class="small text-muted fst-italic">${p.instructions}</div>
            </div>
        `).join("");
    }

    const pastContainer = document.getElementById("recordPastVisitsContainer");
    if (pastContainer) {
        pastContainer.innerHTML = rec.pastVisits.map(v => `
            <div class="p-3 bg-light rounded-3 border mb-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-dark-green">${v.issue}</span>
                    <span class="badge bg-white text-muted border">${v.date}</span>
                </div>
                <p class="small text-muted mb-1"><i class="bi bi-hospital me-1"></i> ${v.facility} • ${v.doctor}</p>
                <p class="small text-secondary mb-0"><strong>Outcome:</strong> ${v.outcome}</p>
            </div>
        `).join("");
    }
}

function printHealthRecord() {
    window.print();
}

// -------------------------------------------------------------
// 11. MEDICINE AVAILABILITY
// -------------------------------------------------------------
function renderMedicinesList(query = "") {
    const container = document.getElementById("medicinesGridContainer");
    if (!container) return;

    const q = query.toLowerCase();
    const filtered = HealthcareData.medicines.filter(m => {
        return m.name.toLowerCase().includes(q) || 
               m.facility.toLowerCase().includes(q) || 
               m.category.toLowerCase().includes(q);
    });

    container.innerHTML = filtered.map(m => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="health-card h-100 d-flex flex-column justify-content-between">
                <div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-light text-muted border">${m.category}</span>
                        <span class="${m.statusClass}">${m.status}</span>
                    </div>
                    <h5 class="text-dark-green mb-1 fs-6">${m.name}</h5>
                    <p class="small text-muted mb-2"><i class="bi bi-hospital me-1"></i> ${m.facility}</p>
                    <div class="p-2 bg-light-green rounded-2 mb-2 small">
                        <span class="text-muted d-block" style="font-size:0.75rem;">Current Facility Inventory:</span>
                        <strong class="text-dark-green">${m.stockCount}</strong>
                    </div>
                </div>
                <div class="pt-2 border-top d-flex justify-content-between align-items-center">
                    <span class="badge bg-success-subtle text-success">Free Govt Supply</span>
                    <button class="btn btn-sm btn-green-soft" onclick="requestMedicineRefill('${m.name}')">
                        <i class="bi bi-bag-check me-1"></i> Request
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function requestMedicineRefill(medName) {
    showToast("Request Logged", `Stock dispatch request created for "${medName}".`, "success");
}

// -------------------------------------------------------------
// 12. DIAGNOSTIC SERVICES
// -------------------------------------------------------------
function renderDiagnosticsList(query = "") {
    const container = document.getElementById("diagnosticsGridContainer");
    if (!container) return;

    const q = query.toLowerCase();
    const filtered = HealthcareData.diagnosticServices.filter(d => {
        return d.name.toLowerCase().includes(q) || 
               d.facility.toLowerCase().includes(q) || 
               d.type.toLowerCase().includes(q);
    });

    container.innerHTML = filtered.map(d => `
        <div class="col-md-6 mb-4">
            <div class="health-card h-100 d-flex flex-column justify-content-between">
                <div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge-available"><i class="bi bi-check-circle"></i> ${d.availability}</span>
                        <span class="badge bg-success text-white">${d.cost}</span>
                    </div>
                    <h4 class="text-dark-green mb-1 fs-5">${d.name}</h4>
                    <p class="small text-muted mb-2"><i class="bi bi-hospital me-1"></i> ${d.facility} • ${d.type}</p>
                    <p class="small text-secondary mb-3">${d.purpose}</p>

                    <div class="d-flex gap-3 small bg-light p-2 rounded-2 mb-3">
                        <span><i class="bi bi-stopwatch text-success me-1"></i> <strong>${d.turnaround}</strong></span>
                        <span><i class="bi bi-eyedropper text-danger me-1"></i> ${d.sampleType}</span>
                    </div>
                </div>
                <div class="d-flex gap-2 pt-2 border-top">
                    <button class="btn btn-green-outline btn-sm flex-fill" onclick="viewDiagnosticDetails('${d.id}')">
                        <i class="bi bi-file-text me-1"></i> View Prep
                    </button>
                    <button class="btn btn-green-primary btn-sm flex-fill" onclick="requestDiagnosticTest('${d.name}')">
                        <i class="bi bi-plus-circle me-1"></i> Request Test
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function viewDiagnosticDetails(diagId) {
    const d = HealthcareData.diagnosticServices.find(t => t.id === diagId);
    if (!d) return;

    const modalBody = document.getElementById("diagnosticDetailsModalBody");
    if (modalBody) {
        modalBody.innerHTML = `
            <h4 class="text-dark-green">${d.name}</h4>
            <span class="badge bg-light text-muted border mb-3">${d.type}</span>
            <div class="p-3 bg-light-green rounded-3 border border-light-green mb-3">
                <span class="d-block small text-muted font-weight-bold">Clinical Clinical Indication:</span>
                <span class="small fw-semibold text-dark-green">${d.purpose}</span>
            </div>
            <ul class="list-group list-group-flush small mb-3">
                <li class="list-group-item d-flex justify-content-between">
                    <span class="text-muted">Sample Required:</span>
                    <span class="fw-bold">${d.sampleType}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span class="text-muted">Reporting Time:</span>
                    <span class="fw-bold text-success">${d.turnaround}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span class="text-muted">Government Subsidy:</span>
                    <span class="fw-bold text-success">100% Free under NHM</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span class="text-muted">Preparation Guideline:</span>
                    <span class="fw-bold">No overnight fasting needed unless specified.</span>
                </li>
            </ul>
        `;
    }
    const modalEl = document.getElementById("diagnosticDetailsModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function requestDiagnosticTest(testName) {
    showToast("Test Requisition Created", `Requisition for "${testName}" sent to Rampur PHC Laboratory.`, "success");
}

// -------------------------------------------------------------
// 13. REFERRAL TRACKING
// -------------------------------------------------------------
function advanceReferralStep() {
    const ref = HealthcareData.referral;
    if (ref.currentStep < 4) {
        ref.currentStep++;
        ref.steps.forEach(s => {
            if (s.step < ref.currentStep) {
                s.done = true;
                s.current = false;
            } else if (s.step === ref.currentStep) {
                s.done = true;
                s.current = true;
            } else {
                s.done = false;
                s.current = false;
            }
        });
        if (ref.currentStep === 4) {
            ref.currentStatus = "Completed";
            ref.steps[3].date = "Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        renderReferralTimeline();
        showToast("Referral Advanced", `Referral moved to step: ${ref.steps[ref.currentStep - 1].name}`, "info");
    } else {
        showToast("Referral Finalized", "Counter-referral summary is fully completed.", "success");
    }
}

function renderReferralTimeline() {
    const ref = HealthcareData.referral;
    const stepperContainer = document.getElementById("referralStepperContainer");
    if (stepperContainer) {
        stepperContainer.innerHTML = ref.steps.map(s => {
            const isCompleted = s.done && !s.current;
            const isActive = s.current;
            const statusClass = isCompleted ? 'completed' : (isActive ? 'active' : '');
            return `
                <div class="referral-step ${statusClass}">
                    <div class="step-circle">
                        ${isCompleted ? '<i class="bi bi-check-lg"></i>' : s.step}
                    </div>
                    <div>
                        <div class="step-label">${s.name}</div>
                        <div class="step-time">${s.date}</div>
                    </div>
                </div>
            `;
        }).join("");
    }

    const statusBadge = document.getElementById("referralCurrentStatusBadge");
    if (statusBadge) {
        statusBadge.textContent = ref.currentStatus;
        statusBadge.className = ref.currentStatus === "Completed" ? "badge bg-success" : "badge bg-warning text-dark";
    }
}

// -------------------------------------------------------------
// 14. FOLLOW-UP REMINDERS
// -------------------------------------------------------------
function renderRemindersList() {
    const container = document.getElementById("remindersListContainer");
    if (!container) return;

    container.innerHTML = HealthcareData.reminders.map(r => `
        <div class="col-md-6 mb-3" id="rem-card-${r.id}">
            <div class="health-card d-flex flex-column justify-content-between h-100">
                <div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-light-green text-primary-green border border-light-green">
                            <i class="bi ${r.icon} me-1"></i> ${r.type}
                        </span>
                        <span class="badge bg-warning-subtle text-warning border border-warning-subtle">${r.status}</span>
                    </div>
                    <h5 class="text-dark-green mb-1 fs-6">${r.purpose}</h5>
                    <p class="small text-muted mb-2"><i class="bi bi-calendar-event text-success me-1"></i> ${r.date}</p>
                    <p class="small text-secondary mb-3"><i class="bi bi-geo-alt me-1"></i> ${r.facility}</p>
                </div>
                <div class="d-flex gap-2 pt-2 border-top">
                    <button class="btn btn-green-outline btn-sm flex-fill" onclick="snoozeReminder('${r.id}')">
                        <i class="bi bi-clock-history me-1"></i> Reschedule
                    </button>
                    <button class="btn btn-green-primary btn-sm flex-fill" onclick="completeReminder('${r.id}')">
                        <i class="bi bi-check2-circle me-1"></i> Mark Done
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function completeReminder(remId) {
    const card = document.getElementById(`rem-card-${remId}`);
    if (card) {
        card.style.opacity = "0.4";
        showToast("Reminder Completed", "Follow-up marked as completed in records.", "success");
    }
}

function snoozeReminder(remId) {
    showToast("Reminder Rescheduled", "Pushed forward by 3 days.", "info");
}

// -------------------------------------------------------------
// 15. ONLINE MODE
// -------------------------------------------------------------
// Handled by online section & live badges

// -------------------------------------------------------------
// 16. OFFLINE MODE
// -------------------------------------------------------------
function renderOfflineQueue() {
    const container = document.getElementById("offlineQueueTableBody");
    if (!container) return;

    const queue = JSON.parse(localStorage.getItem("healthcare_offline_queue") || "[]");

    if (queue.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-check-circle-fill text-success fs-3 d-block mb-1"></i>
                    No pending offline records. All data is synchronized with the central server.
                </td>
            </tr>
        `;
        return;
    }

    container.innerHTML = queue.map((item, idx) => `
        <tr>
            <td><strong>#${item.id}</strong></td>
            <td>${item.name}</td>
            <td>${item.age} Y / ${item.gender}</td>
            <td>${item.village}</td>
            <td><span class="text-truncate d-inline-block" style="max-width: 140px;">${item.symptoms}</span></td>
            <td><span class="badge ${item.priority === 'High' ? 'bg-danger' : 'bg-warning text-dark'}">${item.priority}</span></td>
            <td>
                <span class="badge bg-warning-subtle text-warning border border-warning-subtle">
                    <i class="bi bi-cloud-arrow-up me-1"></i> ${item.syncStatus}
                </span>
            </td>
        </tr>
    `).join("");
}

// -------------------------------------------------------------
// 17. SYNC PROCESS
// -------------------------------------------------------------
function renderSyncStatusOverview() {
    updatePendingBadge();
    const countEl = document.getElementById("syncPendingItemsCount");
    if (countEl) countEl.textContent = AppState.syncStatus.pendingCount;

    const timeEl = document.getElementById("syncLastCompletedTime");
    if (timeEl) timeEl.textContent = AppState.syncStatus.lastSynced;
}

function startSyncProcessSimulation() {
    if (AppState.syncStatus.isSyncing) return;
    
    // Check if network is online
    if (!AppState.isOnline) {
        showToast("Internet Required", "Cannot synchronize while in Offline Mode. Switch to Online Mode first.", "warning");
        return;
    }

    AppState.syncStatus.isSyncing = true;
    const syncBtn = document.getElementById("btnExecuteSync");
    const progressContainer = document.getElementById("syncProgressWrapper");
    const progressBar = document.getElementById("syncProgressBar");
    const statusText = document.getElementById("syncStepStatusText");

    if (syncBtn) syncBtn.classList.add("disabled");
    if (progressContainer) progressContainer.style.display = "block";

    // Step 1: LOCAL STORAGE
    highlightSyncNode(1);
    if (progressBar) progressBar.style.width = "25%";
    if (statusText) statusText.textContent = "Step 1/4: Reading cached records from browser LocalStorage...";

    setTimeout(() => {
        // Step 2: SYNC QUEUE
        highlightSyncNode(2);
        if (progressBar) progressBar.style.width = "50%";
        if (statusText) statusText.textContent = "Step 2/4: Packing records into secure FHIR / HL7 payload queue...";

        setTimeout(() => {
            // Step 3: BACKEND API
            highlightSyncNode(3);
            if (progressBar) progressBar.style.width = "75%";
            if (statusText) statusText.textContent = "Step 3/4: Handshaking with State Health Central API gateway...";

            setTimeout(() => {
                // Step 4: DATABASE
                highlightSyncNode(4);
                if (progressBar) progressBar.style.width = "100%";
                if (statusText) statusText.textContent = "Step 4/4: Confirming ACID replication in Central Healthcare Database...";

                setTimeout(() => {
                    // Completion
                    AppState.syncStatus.isSyncing = false;
                    AppState.syncStatus.lastSynced = "Just now (" + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ")";
                    
                    // Mark queue as synced or clear pending
                    localStorage.setItem("healthcare_offline_queue", JSON.stringify([]));
                    updatePendingBadge();
                    renderOfflineQueue();
                    renderSyncStatusOverview();

                    if (syncBtn) syncBtn.classList.remove("disabled");
                    if (statusText) statusText.innerHTML = `<span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i> Data synchronized successfully. Internet Connected.</span>`;

                    showToast("Sync Successful", "All offline records have been committed to the central healthcare database.", "success");
                    
                    // Reset highlighted nodes after delay
                    setTimeout(() => {
                        document.querySelectorAll(".sync-node-box").forEach(n => n.classList.remove("active-sync"));
                    }, 3000);

                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}

function highlightSyncNode(nodeIndex) {
    document.querySelectorAll(".sync-node-box").forEach((node, idx) => {
        if (idx + 1 === nodeIndex) {
            node.classList.add("active-sync");
        } else {
            node.classList.remove("active-sync");
        }
    });
}

// -------------------------------------------------------------
// EMERGENCY ACTIONS (108 SOS)
// -------------------------------------------------------------
function triggerEmergency108() {
    const modalEl = document.getElementById("emergencyModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    showToast("EMERGENCY 108 TRIGGERED", "Nearest ambulance unit alerted with GPS coordinates.", "emergency");
}

function dispatchAmbulanceConfirm() {
    const modalEl = document.getElementById("emergencyModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    showToast("AMBULANCE DISPATCHED", "108 GVK-EMRI Unit UP-64-G-108 dispatched from Rampur PHC. Estimated arrival: 11 mins.", "emergency");
}

// -------------------------------------------------------------
// TOAST NOTIFICATIONS HELPER
// -------------------------------------------------------------
function showToast(title, message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    let icon = "bi-check-circle-fill text-success";
    let extraClass = "";

    if (type === "emergency") {
        icon = "bi-exclamation-triangle-fill text-danger";
        extraClass = "toast-emergency";
    } else if (type === "warning") {
        icon = "bi-exclamation-circle-fill text-warning";
        extraClass = "toast-warning";
    } else if (type === "info") {
        icon = "bi-info-circle-fill text-primary";
    }

    toast.className = `custom-toast ${extraClass}`;
    toast.innerHTML = `
        <i class="bi ${icon} fs-4"></i>
        <div class="flex-grow-1">
            <h6 class="mb-0 fw-bold fs-6">${title}</h6>
            <p class="mb-0 small text-muted">${message}</p>
        </div>
        <button type="button" class="btn-close btn-close-sm" onclick="this.parentElement.remove()"></button>
    `;

    container.appendChild(toast);

    // Auto remove after 4.5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            toast.style.transition = "all 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }
    }, 4500);
}
