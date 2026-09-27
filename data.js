/**
 * Integrated Public Healthcare Platform
 * Mock Data Repository & Initial State
 * Problem Statement: Accessibility and quality of public healthcare services, particularly in rural and underserved areas.
 */

const HealthcareData = {
    // Current Active User State
    currentUser: {
        id: "USR-9912",
        name: "Ramesh Kumar",
        role: "Patient", // Patient | Doctor | Health Worker | Health Partner
        roleTitle: "Rural Citizen & Beneficiary",
        age: 42,
        gender: "Male",
        phone: "+91 98765 43210",
        address: "House 42, Ward 3, Village Rampur, Block 2, Dist. Sonbhadra",
        healthId: "14-8921-4320-9912",
        bloodGroup: "B+",
        emergencyContact: "Sunita Kumar (Wife) - +91 98765 43211",
        allergies: "Penicillin, Sulfa drugs",
        chronicConditions: "Mild Hypertension",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
    },

    // Role profiles for role selection
    roles: [
        {
            id: "doctor",
            name: "Doctor",
            subtitle: "PHC / CHC Medical Officer & Specialist",
            description: "Review digital triages, manage OPD queue, conduct teleconsultations, and issue e-prescriptions.",
            icon: "bi-stethoscope",
            defaultName: "Dr. Ramesh Sharma, MBBS",
            badge: "Medical Officer"
        },
        {
            id: "health_worker",
            name: "Health Worker",
            subtitle: "ASHA / ANM Village Health Companion",
            description: "Conduct doorstep screenings, register rural patients offline, arrange referrals, and track VHND visits.",
            icon: "bi-heart-pulse",
            defaultName: "Pooja Devi (ASHA)",
            badge: "Frontline Worker"
        },
        {
            id: "patient",
            name: "Patient",
            subtitle: "Rural Citizen & Family Member",
            description: "Describe symptoms, receive digital triage, book appointments, track queue tokens, and view records.",
            icon: "bi-person-check",
            defaultName: "Ramesh Kumar",
            badge: "Citizen"
        },
        {
            id: "health_partner",
            name: "Health Partner",
            subtitle: "Diagnostic Centre & Jan Aushadhi Pharmacy",
            description: "Update essential medicine stock, process diagnostic test samples, and upload digital lab reports.",
            icon: "bi-capsule",
            defaultName: "Sonbhadra Jan Aushadhi Kendra",
            badge: "Pharmacy & Lab"
        }
    ],

    // Available Symptoms for Triage
    symptoms: [
        { id: "fever", name: "Fever", icon: "bi-thermometer-high", desc: "Elevated temperature or chills", category: "General" },
        { id: "cough", name: "Cough", icon: "bi-lungs", desc: "Dry or phlegmy persistent cough", category: "Respiratory" },
        { id: "headache", name: "Headache", icon: "bi-lightning", desc: "Throbbing frontal or sinus ache", category: "Neurological" },
        { id: "cold", name: "Cold", icon: "bi-droplet", desc: "Runny nose, sneezing & sore throat", category: "Respiratory" },
        { id: "pain", name: "Body Pain", icon: "bi-activity", desc: "Muscle soreness or joint fatigue", category: "Musculoskeletal" },
        { id: "chest_pain", name: "Chest Discomfort", icon: "bi-heartbreak", desc: "Tightness or burning in chest", category: "Emergency" },
        { id: "breathless", name: "Shortness of Breath", icon: "bi-wind", desc: "Difficulty breathing during rest", category: "Emergency" },
        { id: "vomiting", name: "Vomiting / Nausea", icon: "bi-emoji-frown", desc: "Inability to keep liquids down", category: "Digestive" },
        { id: "other", name: "General Weakness", icon: "bi-bandaid", desc: "Dizziness, fatigue or mild cramps", category: "General" }
    ],

    // Healthcare Facilities in Rural Cluster
    facilities: [
        {
            id: "FAC-01",
            name: "Rampur Primary Health Centre (PHC)",
            type: "PHC",
            typeFullName: "Primary Health Centre",
            distance: "2.4 km away",
            distanceKm: 2.4,
            address: "Near Village Panchayat Bhavan, Rampur",
            timing: "8:00 AM – 4:00 PM (Daily)",
            doctorsOnDuty: 3,
            availableService: "General OPD, Maternal & Child Care, Essential Labs, Pharmacy",
            availability: "Open Today",
            isOpen: true,
            beds: 6,
            telemedicineAvailable: true,
            phone: "+91 5444 231001",
            rating: "4.7 / 5"
        },
        {
            id: "FAC-02",
            name: "Chandpur Community Health Centre (CHC)",
            type: "CHC",
            typeFullName: "Community Health Centre",
            distance: "6.1 km away",
            distanceKm: 6.1,
            address: "Main State Highway 5, Chandpur Block",
            timing: "24 Hours Emergency & Day OPD",
            doctorsOnDuty: 8,
            availableService: "Emergency Care, Surgery, Digital X-Ray, Inpatient Ward, Ultrasound",
            availability: "Open 24x7",
            isOpen: true,
            beds: 30,
            telemedicineAvailable: true,
            phone: "+91 5444 242005",
            rating: "4.8 / 5"
        },
        {
            id: "FAC-03",
            name: "Sonbhadra Sub-District Hospital",
            type: "Rural Hospital",
            typeFullName: "Sub-District Rural Hospital",
            distance: "14.5 km away",
            distanceKm: 14.5,
            address: "Civil Lines Road, District Headquarter",
            timing: "24x7 Hospital Services",
            doctorsOnDuty: 15,
            availableService: "Specialist Clinics, ICU, Blood Storage, Dialysis, Advanced Surgery",
            availability: "Open 24x7",
            isOpen: true,
            beds: 100,
            telemedicineAvailable: true,
            phone: "+91 5444 280010",
            rating: "4.9 / 5"
        },
        {
            id: "FAC-04",
            name: "Shivpur Health & Wellness Sub-Centre",
            type: "Sub-Centre",
            typeFullName: "Ayushman Arogya Mandir (Sub-Centre)",
            distance: "1.1 km away",
            distanceKm: 1.1,
            address: "Primary School Road, Shivpur Village",
            timing: "9:00 AM – 2:00 PM",
            doctorsOnDuty: 1, // Community Health Officer
            availableService: "First Aid, NCD Screening, ANC Checks, Child Immunization",
            availability: "Open Today",
            isOpen: true,
            beds: 2,
            telemedicineAvailable: true,
            phone: "+91 5444 210088",
            rating: "4.6 / 5"
        }
    ],

    // Active Appointment / Queue details
    currentAppointment: {
        id: "APT-2026-1044",
        facilityName: "Rampur Primary Health Centre (PHC)",
        facilityType: "PHC",
        doctorName: "Dr. Ramesh Sharma, MBBS",
        doctorSpecialty: "General Medical Officer",
        date: "Today, 27 Sep 2026",
        time: "10:30 AM",
        tokenNumber: "Token No. 12",
        currentTokenServing: "Token No. 9",
        patientsAhead: 3,
        estimatedWaitMins: 10,
        status: "Waiting in Queue",
        consultationMode: "Video Teleconsultation"
    },

    // Consultation & Health Records
    consultationRecord: {
        visitDate: "27 Sep 2026",
        doctor: {
            name: "Dr. Ramesh Sharma, MBBS",
            role: "Senior Medical Officer",
            regNo: "MCI-48291 / UP",
            facility: "Rampur Primary Health Centre (PHC)"
        },
        vitals: {
            bp: "124/82 mmHg",
            pulse: "78 bpm",
            spo2: "98% on room air",
            temperature: "100.2 °F",
            weight: "66 kg"
        },
        clinicalNotes: "Patient presents with acute onset fever for 3 days accompanied by moderate productive cough and headache. No respiratory distress. Throat shows mild pharyngeal erythema. Lungs clear to auscultation bilateral vesicular sounds.",
        diagnosis: "Acute Viral Upper Respiratory Infection (URI) with seasonal pyrexia",
        prescriptions: [
            {
                name: "Tab. Paracetamol 500mg",
                dosage: "1 tablet three times a day after meals",
                duration: "3 days",
                instructions: "Take when temperature exceeds 99°F"
            },
            {
                name: "Tab. Cetirizine 10mg",
                dosage: "1 tablet at bedtime",
                duration: "5 days",
                instructions: "Relieves runny nose and cough irritation"
            },
            {
                name: "ORS (Oral Rehydration Salts)",
                dosage: "1 sachet dissolved in 1 litre boiled cool water",
                duration: "As needed",
                instructions: "Sip throughout the day for hydration"
            },
            {
                name: "Steam Inhalation & Warm Fluids",
                dosage: "Twice daily",
                duration: "5 days",
                instructions: "Avoid cold beverages"
            }
        ],
        labRequests: [
            { test: "Complete Blood Count (CBC)", status: "Ordered at PHC Lab", expected: "Same day, 2:00 PM" },
            { test: "Malaria Smear / Rapid Test", status: "Negative (Completed)", expected: "On record" }
        ],
        pastVisits: [
            {
                date: "14 Aug 2026",
                facility: "Rampur PHC",
                doctor: "Dr. Ramesh Sharma",
                issue: "Seasonal Allergic Rhinitis & Eye Itching",
                outcome: "Resolved with antihistamines"
            },
            {
                date: "05 May 2026",
                facility: "Chandpur CHC",
                doctor: "Dr. S. Verma",
                issue: "Annual NCD Routine Screening (Hypertension check)",
                outcome: "BP 130/84 mmHg. Advised low salt diet & exercise"
            }
        ]
    },

    // Medicine Inventory at Public Facilities
    medicines: [
        {
            id: "MED-01",
            name: "Paracetamol 500mg (Antipyretic / Pain)",
            generic: "Paracetamol IP",
            facility: "Rampur PHC",
            stockCount: "480 strips",
            status: "Available",
            statusClass: "badge-available",
            category: "Essential Fever Care",
            freeSupply: true
        },
        {
            id: "MED-02",
            name: "Amoxicillin 250mg Capsules (Antibiotic)",
            generic: "Amoxicillin IP",
            facility: "Rampur PHC",
            stockCount: "190 strips",
            status: "Available",
            statusClass: "badge-available",
            category: "Infection Control",
            freeSupply: true
        },
        {
            id: "MED-03",
            name: "Metformin 500mg Tablets (Diabetes)",
            generic: "Metformin Hydrochloride",
            facility: "Rampur PHC",
            stockCount: "28 strips remaining",
            status: "Limited",
            statusClass: "badge-limited",
            category: "NCD Care",
            freeSupply: true
        },
        {
            id: "MED-04",
            name: "Oral Rehydration Salts (ORS) Sachets",
            generic: "WHO-Formula ORS",
            facility: "Rampur PHC",
            stockCount: "850 packets",
            status: "Available",
            statusClass: "badge-available",
            category: "Dehydration & Diarrhea",
            freeSupply: true
        },
        {
            id: "MED-05",
            name: "Iron & Folic Acid (IFA) Tablets",
            generic: "Ferrous Sulfate + Folic Acid",
            facility: "Rampur PHC",
            stockCount: "620 strips",
            status: "Available",
            statusClass: "badge-available",
            category: "Maternal & Child Health",
            freeSupply: true
        },
        {
            id: "MED-06",
            name: "Amlodipine 5mg Tablets (Hypertension)",
            generic: "Amlodipine Besylate",
            facility: "Chandpur CHC",
            stockCount: "340 strips",
            status: "Available",
            statusClass: "badge-available",
            category: "Cardiovascular",
            freeSupply: true
        },
        {
            id: "MED-07",
            name: "Azithromycin 500mg Tablets",
            generic: "Azithromycin IP",
            facility: "Chandpur CHC",
            stockCount: "16 strips remaining",
            status: "Limited",
            statusClass: "badge-limited",
            category: "Respiratory Infection",
            freeSupply: true
        },
        {
            id: "MED-08",
            name: "Anti-Rabies Vaccine (ARV) Vials",
            generic: "Purified Vero Cell Rabies Vaccine",
            facility: "Chandpur CHC",
            stockCount: "45 doses in cold chain",
            status: "Available",
            statusClass: "badge-available",
            category: "Emergency Biologicals",
            freeSupply: true
        },
        {
            id: "MED-09",
            name: "Anti-Snake Venom (ASV) Serum",
            generic: "Polyvalent Snake Antivenom",
            facility: "Chandpur CHC",
            stockCount: "12 vials in cold storage",
            status: "Available",
            statusClass: "badge-available",
            category: "Emergency Trauma",
            freeSupply: true
        },
        {
            id: "MED-10",
            name: "Albendazole 400mg Chewable (Deworming)",
            generic: "Albendazole USP",
            facility: "Shivpur Sub-Centre",
            stockCount: "520 tablets",
            status: "Available",
            statusClass: "badge-available",
            category: "Child Health",
            freeSupply: true
        },
        {
            id: "MED-11",
            name: "Human Regular Insulin 100 IU/ml",
            generic: "Recombinant Human Insulin",
            facility: "Sonbhadra Rural Hospital",
            stockCount: "65 vials (Cold Chain)",
            status: "Available",
            statusClass: "badge-available",
            category: "Specialist Care",
            freeSupply: true
        },
        {
            id: "MED-12",
            name: "Pediatric Cough Drops 15ml",
            generic: "Ambroxol + Levosalbutamol",
            facility: "Shivpur Sub-Centre",
            stockCount: "0 in stock (Restocking 29 Sep)",
            status: "Unavailable",
            statusClass: "badge-unavailable",
            category: "Pediatric",
            freeSupply: true
        }
    ],

    // Diagnostic Services at Facilities
    diagnosticServices: [
        {
            id: "DIAG-01",
            name: "Complete Blood Count (CBC)",
            type: "Hematology Lab",
            facility: "Rampur PHC",
            availability: "Available Today (8:00 AM – 2:00 PM)",
            turnaround: "Report within 2 Hours",
            cost: "Free (Govt. Public Health Scheme)",
            sampleType: "Whole Blood (EDTA)",
            purpose: "Checks hemoglobin, platelets, white blood cells for infection, anemia or dengue."
        },
        {
            id: "DIAG-02",
            name: "Blood Glucose (Fasting & PP)",
            type: "Biochemistry",
            facility: "Rampur PHC",
            availability: "Available Today (8:00 AM – 1:00 PM)",
            turnaround: "Instant (15 mins via analyzer)",
            cost: "Free",
            sampleType: "Blood drop / Serum",
            purpose: "Screening and management of diabetes mellitus."
        },
        {
            id: "DIAG-03",
            name: "12-Lead Electrocardiogram (ECG)",
            type: "Cardiology Screening",
            facility: "Chandpur CHC",
            availability: "Available 24x7 in Emergency",
            turnaround: "Immediate (Printed & Tele-interpreted)",
            cost: "Free",
            sampleType: "Non-invasive surface leads",
            purpose: "Detects heart rhythms, ischemia, chest pain evaluation."
        },
        {
            id: "DIAG-04",
            name: "Digital Chest X-Ray",
            type: "Radiology",
            facility: "Chandpur CHC",
            availability: "Available Today (9:00 AM – 3:00 PM)",
            turnaround: "Report within 1 Hour",
            cost: "Free",
            sampleType: "Digital Radiograph",
            purpose: "Examines lungs, pneumonia, TB, pleurisy and heart size."
        },
        {
            id: "DIAG-05",
            name: "Sputum Smear Examination (AFB)",
            type: "Microbiology (TB Elimination)",
            facility: "Rampur PHC",
            availability: "Available Mon–Sat",
            turnaround: "Report within 24 Hours",
            cost: "Free (NTEP Program)",
            sampleType: "Early morning sputum",
            purpose: "Diagnostic smear for Mycobacterium Tuberculosis."
        },
        {
            id: "DIAG-06",
            name: "Rapid Malaria Antigen (Pf / Pv)",
            type: "Infectious Disease Test",
            facility: "Rampur PHC & Sub-Centres",
            availability: "Available 24x7 (Point-of-Care)",
            turnaround: "15 – 20 Minutes",
            cost: "Free",
            sampleType: "Finger prick blood",
            purpose: "Rapid diagnosis of Plasmodium falciparum / vivax malaria."
        },
        {
            id: "DIAG-07",
            name: "Obstetric / Abdominal Ultrasound (USG)",
            type: "Ultrasonography",
            facility: "Chandpur CHC",
            availability: "Available Tue & Fri (Dr. Verma)",
            turnaround: "Same-day printed report",
            cost: "Free (Pradhan Mantri Surakshit Matritva)",
            sampleType: "Non-invasive scan",
            purpose: "Antenatal screening, fetal growth, gallstones, abdominal pain."
        },
        {
            id: "DIAG-08",
            name: "Liver & Kidney Function Tests (LFT/KFT)",
            type: "Automated Biochemistry",
            facility: "Sonbhadra Rural Hospital",
            availability: "Available Mon–Sat",
            turnaround: "Same-day within 4 Hours",
            cost: "Free",
            sampleType: "Venous blood serum",
            purpose: "Assesses organ function for long-term medications or jaundice."
        }
    ],

    // Referral System
    referral: {
        id: "REF-2026-8941",
        patientName: "Ramesh Kumar",
        ageGender: "42 Y / Male",
        referringFacility: "Rampur Primary Health Centre (PHC)",
        referringDoctor: "Dr. Ramesh Sharma, MBBS (MO)",
        targetFacility: "Chandpur Community Health Centre (CHC)",
        targetDepartment: "Pulmonology & Radiology Specialist OPD",
        targetDoctor: "Dr. Sunita Verma, MD (Chest Physician)",
        reason: "Recurrent chest congestion with 3-day pyrexia. Requires high-definition Chest X-Ray and specialist pulmonology evaluation.",
        currentStatus: "Scheduled", // Requested | Accepted | Scheduled | Completed
        currentStep: 3, // 1 to 4
        steps: [
            {
                step: 1,
                name: "Requested",
                date: "26 Sep 2026, 09:30 AM",
                desc: "Referral requisition drafted by Dr. Sharma at Rampur PHC.",
                done: true
            },
            {
                step: 2,
                name: "Accepted",
                date: "26 Sep 2026, 11:15 AM",
                desc: "Referral reviewed and accepted by CHC Chandpur Medical Desk.",
                done: true
            },
            {
                step: 3,
                name: "Scheduled",
                date: "28 Sep 2026, 10:00 AM",
                desc: "Slot confirmed with Dr. Sunita Verma, Room 4, CHC Chandpur.",
                done: true,
                current: true
            },
            {
                step: 4,
                name: "Completed",
                date: "Pending Consultation",
                desc: "Specialist consultation, X-Ray report upload and counter-referral slip.",
                done: false
            }
        ]
    },

    // Follow-up Reminders
    reminders: [
        {
            id: "REM-01",
            type: "Doctor Check-up",
            icon: "bi-calendar-check",
            purpose: "Referral visit with Dr. Sunita Verma (Chest Specialist) at Chandpur CHC",
            date: "Tomorrow, 28 Sep 2026 (10:00 AM)",
            facility: "Chandpur CHC",
            status: "Scheduled",
            statusColor: "status-scheduled"
        },
        {
            id: "REM-02",
            type: "Diagnostic Test",
            icon: "bi-droplet-half",
            purpose: "Post-prandial blood sugar & CBC review check",
            date: "02 Oct 2026 (08:30 AM)",
            facility: "Rampur PHC Laboratory",
            status: "Upcoming",
            statusColor: "status-upcoming"
        },
        {
            id: "REM-03",
            type: "Medicine Follow-up",
            icon: "bi-capsule-pill",
            purpose: "Complete 5-day course of Paracetamol & Cetirizine; review if fever recurs",
            date: "03 Oct 2026",
            facility: "Home Monitoring / PHC Teleconsult",
            status: "In Progress",
            statusColor: "status-in-progress"
        },
        {
            id: "REM-04",
            type: "Village Health & Nutrition Day (VHND)",
            icon: "bi-people",
            purpose: "Community health, NCD blood pressure screening & dietary advice by ASHA Pooja Devi",
            date: "10 Oct 2026 (09:00 AM)",
            facility: "Village Rampur Anganwadi Centre",
            status: "Upcoming",
            statusColor: "status-upcoming"
        }
    ],

    // Default offline registration samples in LocalStorage
    defaultOfflineRegistrations: [
        {
            id: "OFF-101",
            name: "Meena Devi",
            age: 28,
            gender: "Female",
            village: "Shivpur Tola",
            symptoms: "Mild fever, morning sickness, dizziness",
            priority: "Medium",
            timestamp: "26 Sep 2026, 04:15 PM",
            syncStatus: "Pending Sync"
        },
        {
            id: "OFF-102",
            name: "Ramswaroop Yadav",
            age: 58,
            gender: "Male",
            village: "Rampur West",
            symptoms: "Joint pain in right knee, difficulty walking",
            priority: "Low",
            timestamp: "26 Sep 2026, 05:40 PM",
            syncStatus: "Pending Sync"
        }
    ]
};

// Export to window
window.HealthcareData = HealthcareData;
