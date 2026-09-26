document.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    const isAdminParam = urlParams.get('admin') === 'true';
    const isAdminSaved = localStorage.getItem('isAdmin') === 'true' ||
        localStorage.getItem('isAdminLoggedIn') === 'true';

    if (isAdminParam) {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('isAdminLoggedIn', 'true');
    }

    if (isAdminParam || isAdminSaved) {
        document.body.classList.add('is-admin');
        console.log('Admin Mode Enabled');
    }

    // Helper Utility: Safe query selector wrapper
    const getEl = (id) => document.getElementById(id);
    const getAll = (selector) => document.querySelectorAll(selector);

    const adminLoginBtn = getEl('adminLoginBtn');

    function applyAdminState() {
        const isAdmin = document.body.classList.contains('is-admin') ||
            localStorage.getItem('isAdminLoggedIn') === 'true' ||
            localStorage.getItem('isAdmin') === 'true';

        document.body.classList.toggle('is-admin', isAdmin);
        const githubUrlInput = getEl('githubUrlInput');
        const importGithubBtn = getEl('importGithubBtn');
        if (githubUrlInput) githubUrlInput.disabled = !isAdmin;
        if (importGithubBtn) importGithubBtn.disabled = !isAdmin;
        if (adminLoginBtn) {
            adminLoginBtn.textContent = isAdmin ? 'Admin Mode (Click to Logout)' : 'Admin Access';
        }
    }

    applyAdminState();

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            const isAdmin = document.body.classList.contains('is-admin');

            if (isAdmin) {
                localStorage.removeItem('isAdmin');
                localStorage.removeItem('isAdminLoggedIn');
                document.body.classList.remove('is-admin');
                applyAdminState();
                alert('Logged out from Admin mode.');
                return;
            }

            const passcode = window.prompt('Enter Admin Passcode:');
            if (passcode === 'om123') {
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('isAdminLoggedIn', 'true');
                document.body.classList.add('is-admin');
                applyAdminState();
                alert('Admin access granted!');
            } else if (passcode !== null) {
                alert('Incorrect passcode!');
            }
        });
    }

    if (localStorage.getItem('userResumeUrl')?.startsWith('blob:')) {
        localStorage.removeItem('userResumeUrl');
    }

    function syncResumeButton() {
        const savedResumeUrl = localStorage.getItem('userResumeUrl') || 'assets/docs/resume.pdf';
        const resumeButton = getEl('heroResumeBtn');
        if (resumeButton) resumeButton.setAttribute('href', savedResumeUrl);
    }

    syncResumeButton();

    // Mobile navigation toggle
    const mobileMenuToggle = getEl('mobileMenuToggle');
    const mobileMenu = getEl('mobileMenu');

    function closeMobileMenu() {
        if (!mobileMenu || !mobileMenuToggle) return;
        mobileMenu.classList.remove('is-open');
        mobileMenuToggle.classList.remove('is-open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', 'Open navigation menu');
    }

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('is-open');
            mobileMenuToggle.classList.toggle('is-open', isOpen);
            mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
            mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        });

        mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));
    }

    // Reveal sections as they enter the viewport, unless motion is disabled.
    const revealSections = getAll('.fade-in-section');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (reducedMotionQuery.matches || !('IntersectionObserver' in window)) {
        revealSections.forEach((section) => section.classList.add('is-visible'));
    } else {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

        revealSections.forEach((section) => sectionObserver.observe(section));
    }

    // Cycle through roles in the hero without animating for reduced-motion users.
    const typingText = getEl('typingText');
    const typingRoles = ['Visual Developer', 'Frontend Specialist', 'Android Creator'];
    let typingRoleIndex = 0;
    let typingCharacterIndex = 0;
    let isDeletingTypingText = false;

    function runTypingEffect() {
        if (!typingText || reducedMotionQuery.matches) return;
        const currentRole = typingRoles[typingRoleIndex];
        typingCharacterIndex += isDeletingTypingText ? -1 : 1;
        typingText.textContent = currentRole.slice(0, typingCharacterIndex);

        if (!isDeletingTypingText && typingCharacterIndex === currentRole.length) {
            isDeletingTypingText = true;
            setTimeout(runTypingEffect, 1800);
            return;
        }

        if (isDeletingTypingText && typingCharacterIndex === 0) {
            isDeletingTypingText = false;
            typingRoleIndex = (typingRoleIndex + 1) % typingRoles.length;
        }

        setTimeout(runTypingEffect, isDeletingTypingText ? 45 : 85);
    }

    if (typingText && !reducedMotionQuery.matches) setTimeout(runTypingEffect, 700);

    // Keep the ambient spotlight and custom cursor on the compositor-friendly path.
    const customCursor = getEl('customCursor');
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    if (customCursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotionQuery.matches) {
        document.addEventListener('mousemove', (event) => {
            pointerX = event.clientX;
            pointerY = event.clientY;
            if (pointerFrame) return;
            pointerFrame = requestAnimationFrame(() => {
                customCursor.style.left = `${pointerX}px`;
                customCursor.style.top = `${pointerY}px`;
                document.documentElement.style.setProperty('--spotlight-x', `${pointerX}px`);
                document.documentElement.style.setProperty('--spotlight-y', `${pointerY}px`);
                customCursor.style.opacity = '1';
                pointerFrame = 0;
            });
        });

        document.querySelectorAll('a, button, .project-card').forEach((element) => {
            element.addEventListener('mouseenter', () => customCursor.classList.add('is-active'));
            element.addEventListener('mouseleave', () => customCursor.classList.remove('is-active'));
        });
    }

    // Track created Object URLs to prevent memory leaks
    const createdObjectUrls = new Set();
    const createSafeObjectURL = (file) => {
        const url = URL.createObjectURL(file);
        createdObjectUrls.add(url);
        return url;
    };

    // 0. INTERACTIVE 3D TILT EFFECT FOR PROFILE PICTURE
    const wrapper = getEl("imageWrapper");
    const img = getEl("heroImg");

    if (wrapper && img) {
        wrapper.addEventListener("mousemove", (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = (-y / rect.height) * 12;
            const rotateY = (x / rect.width) * 12;

            img.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        wrapper.addEventListener("mouseleave", () => {
            img.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            img.style.transition = "transform 0.5s ease";
        });

        wrapper.addEventListener("mouseenter", () => {
            img.style.transition = "none";
        });
    }

    // 1. HORIZONTAL PROJECT SLIDER CONTROLS
    const slider = getEl('projectsSlider') || getEl('projectSlider');
    const prevBtn = getEl('slideLeftBtn') || getEl('prevBtn');
    const nextBtn = getEl('slideRightBtn') || getEl('nextBtn');

    if (slider && prevBtn && nextBtn) {
        const getScrollAmount = () => {
            const firstCard = slider.querySelector('.project-card');
            if (!firstCard) return 384;
            const cardStyle = window.getComputedStyle(firstCard);
            const gap = parseFloat(window.getComputedStyle(slider).columnGap || cardStyle.marginRight) || 24;
            return firstCard.getBoundingClientRect().width + gap;
        };

        nextBtn.addEventListener('click', () => {
            slider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });
    }

    // 2. UNIVERSAL DOCUMENT PREVIEW MODAL LOGIC (PDF + IMAGES)
    const docModal = getEl('documentModal');
    const modalImg = getEl('modalImg');
    const modalFrame = getEl('modalFrame');
    const modalTitle = getEl('modalTitle');
    const closeDocModal = getEl('closeDocModal');

    function bindModalTrigger(button) {
        if (!button) return;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const docSrc = button.getAttribute('data-doc');
            const docTitle = button.getAttribute('data-title') || 'Document View';

            if (!docSrc) return;

            if (modalTitle) modalTitle.textContent = docTitle;

            const isPdf = docSrc.toLowerCase().includes('.pdf') ||
                (docSrc.startsWith('blob:') && button.closest('.compact-doc-card')?.querySelector('.fa-file-pdf'));

            if (isPdf) {
                if (modalImg) { modalImg.style.display = 'none'; modalImg.src = ''; }
                if (modalFrame) { modalFrame.src = docSrc; modalFrame.style.display = 'block'; }
            } else {
                if (modalFrame) { modalFrame.style.display = 'none'; modalFrame.src = ''; }
                if (modalImg) { modalImg.src = docSrc; modalImg.style.display = 'block'; }
            }

            if (docModal) docModal.style.display = 'flex';
        });
    }

    getAll('.view-doc-btn').forEach(bindModalTrigger);

    function closeDocumentModal() {
        if (docModal) docModal.style.display = 'none';
        if (modalFrame) modalFrame.src = '';
        if (modalImg) modalImg.src = '';
    }

    if (closeDocModal) closeDocModal.addEventListener('click', closeDocumentModal);

    window.addEventListener('click', (e) => {
        if (e.target === docModal) closeDocumentModal();
    });

    // 3. DIRECT MARKSHEET UPLOADER HANDLER (10th, 12th, BCA)
    getAll('.direct-marksheet-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const cardType = input.getAttribute('data-card') || 'Academic';

            if (!file) return;

            const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image (JPG, PNG) or PDF document.');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert('File size exceeds 10MB limit.');
                return;
            }

            const tempUrl = createSafeObjectURL(file);
            const card = input.closest('.academic-card');
            if (card) {
                const viewBtn = card.querySelector('.view-doc-btn');
                if (viewBtn) viewBtn.setAttribute('data-doc', tempUrl);

                const statusSpan = card.querySelector(`.status-${cardType.toLowerCase()}`);
                if (statusSpan) {
                    statusSpan.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Uploaded: ${file.name.substring(0, 16)}...`;
                }
            }

            alert(`${cardType} Marksheet "${file.name}" uploaded successfully!`);
        });
    });

    // 4. ACHIEVEMENT TAB FILTERING & INDIVIDUAL DELETION
    const tabBtns = getAll('.tab-btn');
    const achievementsGrid = getEl('achievementsGrid');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-tab');

            getAll('.achievement-card').forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    if (achievementsGrid) {
        achievementsGrid.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-single-btn');
            if (deleteBtn) {
                const card = deleteBtn.closest('.achievement-card');
                if (card && confirm('Are you sure you want to delete this achievement card?')) {
                    card.remove();
                }
            }
        });
    }

    // 5. FILE UPLOAD CATEGORY UI SELECTOR
    const docCategorySelect = getEl('docCategorySelect');
    const metaFields = getEl('metaFields');

    if (docCategorySelect && metaFields) {
        docCategorySelect.addEventListener('change', (e) => {
            const selected = e.target.value;
            metaFields.style.display = (selected === 'courses' || selected === 'sports') ? 'block' : 'none';
        });
    }

    // 6. GALLERY DELETION LOGIC (Select All + Delete Selected + Individual Delete)
    const attachedDocsGrid = getEl('attachedDocsGrid');
    const selectAllCheckbox = getEl('selectAllCheckbox');
    const deleteSelectedBtn = getEl('deleteSelectedBtn');
    const selectedCountSpan = getEl('selectedCount');
    const cvDisplaySection = getEl('cvDisplaySection');

    function updateSelectionState() {
        if (!attachedDocsGrid) return;

        const checkboxes = attachedDocsGrid.querySelectorAll('.doc-select-checkbox');
        const checkedBoxes = attachedDocsGrid.querySelectorAll('.doc-select-checkbox:checked');

        if (selectedCountSpan) selectedCountSpan.textContent = checkedBoxes.length;
        if (deleteSelectedBtn) deleteSelectedBtn.disabled = checkedBoxes.length === 0;

        if (selectAllCheckbox) {
            selectAllCheckbox.checked = checkboxes.length > 0 && checkboxes.length === checkedBoxes.length;
        }

        if (checkboxes.length === 0 && cvDisplaySection) {
            cvDisplaySection.style.display = 'none';
        }
    }

    if (selectAllCheckbox && attachedDocsGrid) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = attachedDocsGrid.querySelectorAll('.doc-select-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateSelectionState();
        });
    }

    if (deleteSelectedBtn && attachedDocsGrid) {
        deleteSelectedBtn.addEventListener('click', () => {
            const checkedBoxes = attachedDocsGrid.querySelectorAll('.doc-select-checkbox:checked');
            if (checkedBoxes.length === 0) return;

            if (confirm(`Are you sure you want to delete ${checkedBoxes.length} selected document(s)?`)) {
                checkedBoxes.forEach(cb => cb.closest('.compact-doc-card')?.remove());
                updateSelectionState();
            }
        });
    }

    if (attachedDocsGrid) {
        attachedDocsGrid.addEventListener('change', (e) => {
            if (e.target.classList.contains('doc-select-checkbox')) {
                updateSelectionState();
            }
        });

        attachedDocsGrid.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-single-btn');
            if (deleteBtn) {
                const card = deleteBtn.closest('.compact-doc-card');
                if (card && confirm('Are you sure you want to delete this document?')) {
                    card.remove();
                    updateSelectionState();
                }
            }
        });
    }

    // 7. MAIN FILE UPLOADER & DYNAMIC GALLERY ADDITION
    const dropZone = getEl('dropZone');
    const fileInput = getEl('fileInput');
    const browseBtn = getEl('browseBtn');
    const fileDetails = getEl('fileDetails');
    const fileName = getEl('fileName');
    const fileSize = getEl('fileSize');
    const progressBar = getEl('progressBar');
    const removeFileBtn = getEl('removeFileBtn');
    const uploadSubmitBtn = getEl('uploadSubmitBtn');
    const certTitleInput = getEl('certTitleInput');

    let selectedFile = null;
    const isAdminMode = () => document.body.classList.contains('is-admin') || localStorage.getItem('isAdmin') === 'true';
    const denyPublicUpload = () => {
        if (isAdminMode()) return false;
        alert('Unauthorized action: Document uploads are restricted to the site owner.');
        return true;
    };

    if (dropZone && fileInput) {
        if (browseBtn) browseBtn.addEventListener('click', (event) => {
            if (denyPublicUpload()) {
                event.preventDefault();
                return;
            }
            fileInput.click();
        });

        dropZone.addEventListener('click', (e) => {
            if (e.target === dropZone || e.target.closest('.drop-zone-content')) {
                if (denyPublicUpload()) {
                    e.preventDefault();
                    return;
                }
                fileInput.click();
            }
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        ['dragleave', 'dragend'].forEach(type => {
            dropZone.addEventListener(type, () => dropZone.classList.remove('drag-over'));
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (denyPublicUpload()) return;
            if (e.dataTransfer.files.length) {
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                if (denyPublicUpload()) {
                    fileInput.value = '';
                    return;
                }
                handleFileSelection(e.target.files[0]);
            }
        });
    }

    function handleFileSelection(file) {
        if (denyPublicUpload()) return;

        const allowedTypes = [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(doc|docx)$/i)) {
            alert('Invalid format. Please upload PDF, PNG, JPG, or DOC files.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit.');
            return;
        }

        selectedFile = file;
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
        if (fileDetails) fileDetails.style.display = 'block';
        if (uploadSubmitBtn) uploadSubmitBtn.disabled = false;

        if (progressBar) {
            progressBar.style.width = '0%';
            let progress = 0;
            const interval = setInterval(() => {
                progress += 25;
                progressBar.style.width = progress + '%';
                if (progress >= 100) clearInterval(interval);
            }, 80);
        }
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedFile = null;
            if (fileInput) fileInput.value = '';
            if (fileDetails) fileDetails.style.display = 'none';
            if (uploadSubmitBtn) uploadSubmitBtn.disabled = true;
        });
    }

    if (uploadSubmitBtn) {
        uploadSubmitBtn.addEventListener('click', () => {
            if (denyPublicUpload()) return;
            if (!selectedFile) return;

            const category = docCategorySelect ? docCategorySelect.value : 'general';
            const fileUrl = createSafeObjectURL(selectedFile);
            const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB';

            if (category === 'resume') {
                localStorage.setItem('userResumeUrl', fileUrl);
                syncResumeButton();
            }

            if ((category === 'resume' || category === 'general') && attachedDocsGrid) {
                let iconClass = 'fa-file-pdf';
                if (selectedFile.type.startsWith('image/')) iconClass = 'fa-file-image';
                else if (selectedFile.name.match(/\.(doc|docx)$/i)) iconClass = 'fa-file-word';

                const newDocCard = document.createElement('div');
                newDocCard.className = 'compact-doc-card';
                newDocCard.innerHTML = `
                    <div class="compact-doc-top-bar">
                        <div class="compact-doc-header">
                            <div class="doc-icon-box">
                                <i class="fa-solid ${iconClass}"></i>
                            </div>
                            <div class="doc-info">
                                <h4 title="${selectedFile.name}">${selectedFile.name}</h4>
                                <small>Format: ${selectedFile.name.split('.').pop().toUpperCase()} • ${fileSizeMB}</small>
                            </div>
                        </div>
                        <input type="checkbox" class="doc-select-checkbox" title="Select item">
                    </div>
                    <div class="compact-doc-actions">
                        <button class="btn btn-outline btn-sm view-doc-btn" data-doc="${fileUrl}" data-title="${selectedFile.name}">
                            View <i class="fa-solid fa-expand"></i>
                        </button>
                        <a href="${fileUrl}" download="${selectedFile.name}" class="btn btn-primary btn-sm">
                            <i class="fa-solid fa-download"></i>
                        </a>
                        <button class="btn btn-danger-icon btn-sm delete-single-btn" title="Delete Document">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;

                attachedDocsGrid.prepend(newDocCard);
                bindModalTrigger(newDocCard.querySelector('.view-doc-btn'));

                if (cvDisplaySection) {
                    cvDisplaySection.style.display = 'block';
                    cvDisplaySection.scrollIntoView({ behavior: 'smooth' });
                }
                updateSelectionState();
                alert(category === 'resume' ? 'Resume updated successfully!' : `"${selectedFile.name}" attached successfully!`);
            }
            else if ((category === 'courses' || category === 'sports') && achievementsGrid) {
                const title = (certTitleInput && certTitleInput.value.trim()) ? certTitleInput.value.trim() : `${category === 'courses' ? 'Course' : 'Sports'} Certificate`;
                const iconClass = category === 'courses' ? 'fa-certificate' : 'fa-trophy';

                const newCard = document.createElement('div');
                newCard.className = 'achievement-card';
                newCard.setAttribute('data-category', category);
                newCard.innerHTML = `
                    <div class="achievement-icon"><i class="fa-solid ${iconClass}"></i></div>
                    <div class="achievement-content">
                        <span class="cert-date">${category === 'courses' ? 'Course Certificate' : 'Sports Achievement'}</span>
                        <h3>${title}</h3>
                        <p>Attached File: ${selectedFile.name}</p>
                        <div class="achievement-card-actions">
                            <button class="btn btn-outline btn-sm view-doc-btn" data-doc="${fileUrl}" data-title="${title}">View <i class="fa-solid fa-expand"></i></button>
                            <button class="btn btn-danger-icon btn-sm delete-single-btn" title="Delete Achievement"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>
                `;

                achievementsGrid.prepend(newCard);
                bindModalTrigger(newCard.querySelector('.view-doc-btn'));

                alert(`New ${category === 'courses' ? 'Course' : 'Sports'} Certificate added successfully!`);
            }

            if (fileInput) fileInput.value = '';
            selectedFile = null;
            if (certTitleInput) certTitleInput.value = '';
            if (fileDetails) fileDetails.style.display = 'none';
            uploadSubmitBtn.disabled = true;
        });
    }

    // 8. PERSISTENT FEATURED PROJECTS SYSTEM
    const projectStorageKey = 'user_featured_projects';
    const defaultProjects = [
        {
            id: 'portfolio-om',
            title: 'Portfolio-om',
            description: 'Web application portfolio built with HTML, CSS, and JavaScript for deployment on Vercel.',
            techStack: ['HTML', 'CSS', 'JavaScript'],
            liveDemoUrl: '',
            githubUrl: 'https://github.com/samalmprakash16/Portfolio-om',
            language: 'CSS',
            stars: 0,
            forks: 0,
            imageUrl: '',
            isFeatured: true
        },
        {
            id: 'student-performance-dashboard',
            title: 'student-performance-dashboard',
            description: 'Interactive data analytics application using Python, Streamlit, and Pandas.',
            techStack: ['Python', 'Streamlit', 'Pandas'],
            liveDemoUrl: '',
            githubUrl: 'https://github.com/samalmprakash16/student-performance-dashboard',
            language: 'Python',
            stars: 0,
            forks: 0,
            imageUrl: '',
            isFeatured: true
        },
        {
            id: 'intelligent-agent-robot-grid-navigation',
            title: 'Intelligent-Agent-Robot-Grid-Navigation',
            description: 'Python simulation of an intelligent robot agent navigating a 20x20 grid.',
            techStack: ['Python'],
            liveDemoUrl: '',
            githubUrl: 'https://github.com/samalmprakash16/Intelligent-Agent-Robot-Grid-Navigation',
            language: 'Python',
            stars: 0,
            forks: 0,
            imageUrl: '',
            isFeatured: true
        },
        {
            id: 'jarwise',
            title: 'JarWise',
            description: 'Financial tracker featuring a clean UI, analytics, and a persistent local database.',
            techStack: ['Kotlin'],
            liveDemoUrl: '',
            githubUrl: 'https://github.com/samalmprakash16/JarWise',
            language: 'Kotlin',
            stars: 0,
            forks: 0,
            imageUrl: '',
            isFeatured: true
        },
        {
            id: 'agridev-ecosystem',
            title: 'AgriDev-Ecosystem',
            description: 'Digital agricultural platform for farm management and direct trade.',
            techStack: ['Java'],
            liveDemoUrl: '',
            githubUrl: 'https://github.com/samalmprakash16/AgriDev-Ecosystem',
            language: 'Java',
            stars: 0,
            forks: 0,
            imageUrl: '',
            isFeatured: true
        }
    ];
    const storedProjects = JSON.parse(localStorage.getItem(projectStorageKey) || 'null');
    let projects = Array.isArray(storedProjects) && storedProjects.length ? storedProjects : defaultProjects;
    const projectSlider = getEl('projectsContainer') || getEl('projectsSlider') || getEl('projectSlider');
    const projectManagerList = getEl('projectManagerList');
    const projectStats = getEl('projectStats');
    const prevPageBtn = getEl('prevPageBtn');
    const nextPageBtn = getEl('nextPageBtn');
    const pageIndicator = getEl('pageIndicator');
    const projectPageSize = 4;
    let projectPage = 1;
    const githubUrlInput = getEl('githubUrlInput');
    const importGithubBtn = getEl('importGithubBtn');
    const isAdmin = isAdminMode();
    if (githubUrlInput) githubUrlInput.disabled = !isAdmin;
    if (importGithubBtn) importGithubBtn.disabled = !isAdmin;
    const projectModal = getEl('projectModal');
    const projectForm = getEl('projectForm');
    const projectModalTitle = getEl('projectModalTitle');
    const projectTechInput = getEl('projectTechInput');
    const techPreview = getEl('techPreview');

    const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));

    const languageColors = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        Kotlin: '#A97BFF',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Java: '#b07219'
    };

    function getSafeExternalUrl(value) {
        try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
        } catch {
            return '';
        }
    }

    function getGithubOpenGraphUrl(githubUrl) {
        const match = String(githubUrl || '').match(/github\.com\/([^/]+)\/([^/?#]+)/i);
        return match ? `https://opengraph.githubassets.com/1/${match[1]}/${match[2].replace(/\.git$/, '')}` : '';
    }

    const normalizeProject = (project) => {
        const githubUrl = project.githubUrl || project.repoUrl || '';
        const techStack = Array.isArray(project.techStack)
            ? project.techStack
            : String(project.techStack || project.tags || '')
                .split(',')
                .map((technology) => technology.trim())
                .filter(Boolean);

        return {
        id: project.id || `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: project.title || 'Untitled Project',
        description: project.description || 'No description provided.',
        techStack,
        liveDemoUrl: project.liveDemoUrl || project.demoUrl || '',
        githubUrl,
        imageUrl: project.imageUrl || project.image || getGithubOpenGraphUrl(githubUrl),
        language: project.language || techStack[0] || 'Code',
        stars: Number(project.stars) || 0,
        forks: Number(project.forks) || 0,
        isFeatured: project.isFeatured !== false
        };
    };
    projects = projects.map(normalizeProject);

    function bindProjectTilt(card) {
        const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!supportsHover || reducedMotionQuery.matches) return;

        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            card.style.transform = `perspective(1000px) rotateX(${-y / 22}deg) rotateY(${x / 22}deg) scale3d(1.015, 1.015, 1.015)`;
            customCursor?.classList.add('is-active');
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            customCursor?.classList.remove('is-active');
        });
    }

    function saveAndRenderProjects() {
        localStorage.setItem('user_featured_projects', JSON.stringify(projects));
        projectPage = 1;
        renderProjects();
    }

    function renderProjects() {
        if (!projectSlider) return;

        const featuredProjects = projects.filter((project) => project.isFeatured);
        const hiddenProjects = projects.filter((project) => !project.isFeatured);
        const totalProjects = featuredProjects.length;
        const totalProjectPages = Math.max(1, Math.ceil(totalProjects / projectPageSize));
        projectPage = Math.min(Math.max(projectPage, 1), totalProjectPages);
        const startIndex = (projectPage - 1) * projectPageSize;
        const endIndex = Math.min(startIndex + projectPageSize, totalProjects);
        const visibleProjects = featuredProjects.slice(startIndex, endIndex);

        if (totalProjects === 0) {
            projectSlider.innerHTML = '<p class="projects-empty-state">No projects available.</p>';
        } else {
            projectSlider.innerHTML = visibleProjects.map((project, index) => {
                const language = project.language || 'Code';
                const languageColor = languageColors[language] || '#6366f1';
                const githubUrl = getSafeExternalUrl(project.githubUrl);
                const demoUrl = getSafeExternalUrl(project.liveDemoUrl);
                const repositoryName = githubUrl
                    ? new URL(githubUrl).pathname.split('/').filter(Boolean).pop()?.replace(/\.git$/, '')
                    : '';
                const repoName = repositoryName || project.title;
                const globalIndex = startIndex + index + 1;
                const safeId = escapeHtml(project.id);
                const repoLink = githubUrl
                    ? `<a href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer" class="repo-name"><i class="fa-brands fa-github" aria-hidden="true"></i> ${escapeHtml(repoName)}</a>`
                    : `<span class="repo-name">${escapeHtml(repoName)}</span>`;

                return `
                    <article class="compact-card">
                        <div class="compact-card-main">
                            <div class="repo-header">
                                ${repoLink}
                                <span class="repo-badge">${githubUrl ? 'Public' : 'Project'}</span>
                            </div>
                            <p class="repo-desc">${escapeHtml(project.description)}</p>
                        </div>
                        <div class="repo-meta">
                            <span><span class="repo-lang-dot" style="background-color: ${languageColor}"></span>${escapeHtml(language)}</span>
                            <span><i class="fa-regular fa-star" aria-hidden="true"></i> ${project.stars}</span>
                            <span><i class="fa-solid fa-code-fork" aria-hidden="true"></i> ${project.forks}</span>
                            <span class="repo-index">#${globalIndex}</span>
                            ${demoUrl ? `<a class="repo-demo-link" href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener noreferrer">Live Demo <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : ''}
                            <span class="repo-admin-actions admin-only">
                                <button type="button" class="icon-btn edit-project-btn admin-only" data-id="${safeId}" title="Edit project" aria-label="Edit ${escapeHtml(project.title)}"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
                                <button type="button" class="icon-btn delete-project-btn admin-only" data-id="${safeId}" title="Delete project" aria-label="Delete ${escapeHtml(project.title)}"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
                            </span>
                        </div>
                    </article>`;
            }).join('');
        }

        if (pageIndicator) {
            pageIndicator.textContent = totalProjects === 0
                ? 'No projects available'
                : `Showing ${startIndex + 1}-${endIndex} of ${totalProjects} Projects`;
        }
        if (prevPageBtn) prevPageBtn.disabled = projectPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = projectPage >= totalProjectPages;

        if (projectStats) {
            projectStats.innerHTML = `
                <div class="project-stat"><strong>${projects.length}</strong> Projects Built</div>
                <div class="project-stat"><strong>${featuredProjects.length}</strong> Featured</div>
                <div class="project-stat"><strong>WEB + APP</strong> Core Focus</div>
            `;
        }

        if (projectManagerList) {
            projectManagerList.innerHTML = hiddenProjects.length ? `
                <p class="project-manager-heading">Hidden projects</p>
                ${hiddenProjects.map((project) => `
                    <div class="project-manager-row">
                        <span>${escapeHtml(project.title)}</span>
                        <div class="project-manager-actions">
                            <button class="btn btn-outline btn-sm edit-project-btn admin-only" data-id="${escapeHtml(project.id)}">Edit / Feature</button>
                            <button class="icon-btn delete-project-btn admin-only" data-id="${escapeHtml(project.id)}" title="Delete project"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>
                `).join('')}
            ` : '';
        }
    }

    if (projectSlider) {
        projectSlider.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-project-btn');
            const deleteBtn = e.target.closest('.delete-project-btn');
            if (editBtn) openProjectForm(editBtn.dataset.id);
            if (deleteBtn) {
                const projectId = deleteBtn.dataset.id;
                if (confirm('Are you sure you want to remove this project?')) {
                    projects = projects.filter((project) => project.id !== projectId);
                    saveAndRenderProjects();
                }
            }
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (projectPage <= 1) return;
            projectPage -= 1;
            renderProjects();
            projectSlider?.scrollIntoView({ behavior: reducedMotionQuery.matches ? 'auto' : 'smooth', block: 'nearest' });
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalFeaturedProjects = projects.filter((project) => project.isFeatured).length;
            if (projectPage * projectPageSize >= totalFeaturedProjects) return;
            projectPage += 1;
            renderProjects();
            projectSlider?.scrollIntoView({ behavior: reducedMotionQuery.matches ? 'auto' : 'smooth', block: 'nearest' });
        });
    }

    function closeProjectForm() {
        if (projectModal) projectModal.classList.remove('active');
        if (projectForm) projectForm.reset();
    }

    function renderTechPreview() {
        if (!techPreview || !projectTechInput) return;
        const technologies = projectTechInput.value.split(',').map((item) => item.trim()).filter(Boolean);
        techPreview.innerHTML = technologies.length
            ? technologies.map((technology) => `<span class="tech-pill">${escapeHtml(technology)}</span>`).join('')
            : '<span class="tech-preview-hint">Your technology tags will appear here.</span>';
    }

    function openProjectForm(projectId = '') {
        const project = projects.find((item) => item.id === projectId);
        projectModalTitle.textContent = project ? 'Edit Project' : 'Add Featured Project';
        projectForm.reset();
        getEl('projectIdInput').value = project?.id || '';
        getEl('projectTitleInput').value = project?.title || '';
        getEl('projectDescriptionInput').value = project?.description || '';
        getEl('projectTechInput').value = project?.techStack.join(', ') || '';
        renderTechPreview();
        getEl('projectLiveUrlInput').value = project?.liveDemoUrl || '';
        getEl('projectGithubUrlInput').value = project?.githubUrl || '';
        getEl('projectImageUrlInput').value = project?.imageUrl || '';
        getEl('projectFeaturedInput').checked = project ? project.isFeatured : true;
        projectModal.classList.add('active');
    }

    if (getEl('addProjectBtn')) getEl('addProjectBtn').addEventListener('click', () => openProjectForm());
    if (getEl('cancelProjectBtn')) getEl('cancelProjectBtn').addEventListener('click', closeProjectForm);
    if (getEl('closeProjectModal')) getEl('closeProjectModal').addEventListener('click', closeProjectForm);
    if (projectTechInput) projectTechInput.addEventListener('input', renderTechPreview);
    if (projectForm) projectForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const projectId = getEl('projectIdInput').value;
        const project = normalizeProject({
            id: projectId,
            title: getEl('projectTitleInput').value.trim(),
            description: getEl('projectDescriptionInput').value.trim(),
            techStack: getEl('projectTechInput').value.split(',').map((item) => item.trim()).filter(Boolean),
            liveDemoUrl: getEl('projectLiveUrlInput').value.trim(),
            githubUrl: getEl('projectGithubUrlInput').value.trim(),
            imageUrl: getEl('projectImageUrlInput').value.trim(),
            isFeatured: getEl('projectFeaturedInput').checked
        });
        projects = projectId ? projects.map((item) => item.id === projectId ? project : item) : [project, ...projects];
        saveAndRenderProjects();
        closeProjectForm();
    });

    // Import from GitHub Handler
    if (importGithubBtn && githubUrlInput && projectSlider) {
        importGithubBtn.addEventListener('click', async () => {
            if (!isAdminMode()) {
                alert('Unauthorized action: Only the portfolio administrator can import projects.');
                return;
            }

            const urlValue = githubUrlInput.value.trim();
            if (!urlValue) {
                alert('Please paste a valid GitHub Repository URL.');
                return;
            }

            const match = urlValue.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) {
                alert('Invalid GitHub URL format. Example: https://github.com/username/repository');
                return;
            }

            const owner = match[1];
            const repo = match[2].replace(/\.git$/, '');

            importGithubBtn.disabled = true;
            importGithubBtn.innerHTML = 'Fetching API... <i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
                if (!response.ok) {
                    throw new Error('Repository not found or is private.');
                }

                const repoData = await response.json();

                const newProject = {
                    id: `github-${owner}-${repo}`,
                    title: repoData.name,
                    description: repoData.description || 'No description provided for this repository.',
                    techStack: repoData.topics && repoData.topics.length > 0
                        ? repoData.topics.slice(0, 3)
                        : [repoData.language || 'Code'],
                    liveDemoUrl: '',
                    githubUrl: repoData.html_url,
                    imageUrl: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
                    isFeatured: true
                };

                projects.unshift(newProject);
                saveAndRenderProjects();

                githubUrlInput.value = '';
                alert(`Project "${newProject.title}" imported successfully from GitHub!`);
            } catch (error) {
                alert(`Failed to fetch repository: ${error.message}`);
            } finally {
                importGithubBtn.disabled = false;
                importGithubBtn.innerHTML = 'Import Project <i class="fa-solid fa-cloud-arrow-down"></i>';
            }
        });
    }

    localStorage.setItem(projectStorageKey, JSON.stringify(projects));
    renderProjects();

    // 9. VIDEO DEMO MODAL & UPLOAD SYSTEM
    const videoModal = getEl('videoDemoModal');
    const closeVideoModal = getEl('closeVideoModal');
    const videoModalTitle = getEl('videoModalTitle');
    const demoVideoPlayer = getEl('demoVideoPlayer');
    const videoContainer = getEl('videoContainer');
    const videoUploadPrompt = getEl('videoUploadPrompt');
    const triggerVideoUploadBtn = getEl('triggerVideoUploadBtn');
    const videoFileInput = getEl('videoFileInput');

    let currentActiveDemoBtn = null;

    function bindVideoDemoTriggers(button) {
        if (!button) return;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            currentActiveDemoBtn = button;
            const projectTitle = button.getAttribute('data-title') || 'Project Demo';
            if (videoModalTitle) videoModalTitle.textContent = `${projectTitle} - Demo`;

            const attachedVideo = button.getAttribute('data-video-src');

            if (attachedVideo) {
                if (demoVideoPlayer) demoVideoPlayer.src = attachedVideo;
                if (videoContainer) videoContainer.style.display = 'block';
                if (videoUploadPrompt) videoUploadPrompt.style.display = 'none';
            } else {
                if (demoVideoPlayer) demoVideoPlayer.src = '';
                if (videoContainer) videoContainer.style.display = 'none';
                if (videoUploadPrompt) videoUploadPrompt.style.display = 'block';
            }

            if (videoModal) videoModal.style.display = 'flex';
        });
    }

    getAll('.live-demo-btn').forEach(bindVideoDemoTriggers);

    if (triggerVideoUploadBtn && videoFileInput) {
        triggerVideoUploadBtn.addEventListener('click', () => videoFileInput.click());

        videoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const videoUrl = createSafeObjectURL(file);

            if (currentActiveDemoBtn) {
                currentActiveDemoBtn.setAttribute('data-video-src', videoUrl);

                const imgHolder = currentActiveDemoBtn.closest('.project-card')?.querySelector('.project-img-holder');
                if (imgHolder) {
                    let badge = imgHolder.querySelector('.video-thumbnail-badge');
                    if (!badge) {
                        badge = document.createElement('div');
                        badge.className = 'video-thumbnail-badge';
                        badge.innerHTML = '<i class="fa-solid fa-video"></i> Demo Ready';
                        imgHolder.appendChild(badge);
                    }
                }

                if (demoVideoPlayer) demoVideoPlayer.src = videoUrl;
                if (videoContainer) videoContainer.style.display = 'block';
                if (videoUploadPrompt) videoUploadPrompt.style.display = 'none';
                alert('Video demo attached successfully!');
            }
        });
    }

    function closeVideoDemoModal() {
        if (videoModal) videoModal.style.display = 'none';
        if (demoVideoPlayer) demoVideoPlayer.pause();
    }

    if (closeVideoModal) closeVideoModal.addEventListener('click', closeVideoDemoModal);

    window.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideoDemoModal();
    });

    // 10. ACTIVE NAVIGATION ON SCROLL
    const sections = getAll('section, footer');
    const navLinks = getAll('.nav-links a');

    if (sections.length && navLinks.length) {
        window.addEventListener('scroll', () => {
            let currentSection = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 120;
                if (window.scrollY >= sectionTop) {
                    currentSection = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (currentSection && link.getAttribute('href').includes(currentSection)) {
                    link.classList.add('active');
                }
            });
        });
    }

    // 9. AI CHATBOT INTERACTION LOGIC (Static / Rule-Based Assistant)
    const aiChatToggle = getEl('aiChatToggle');
    const aiChatPanel = getEl('aiChatPanel');
    const aiChatClose = getEl('aiChatClose');
    const aiChatMessages = getEl('aiChatMessages');
    const aiChatForm = getEl('aiChatForm');
    const aiChatInput = getEl('aiChatInput');

    function openAiChat() {
        if (!aiChatPanel) {
            console.error('Chatbot Error: #aiChatPanel element not found in DOM.');
            return;
        }

        console.info('Portfolio AI: opening chat widget.');
        aiChatPanel.classList.add('is-open');
        aiChatPanel.style.display = 'flex';
        aiChatPanel.setAttribute('aria-hidden', 'false');
        aiChatToggle?.setAttribute('aria-expanded', 'true');
        window.setTimeout(() => aiChatInput?.focus(), 100);
    }

    function closeAiChat() {
        if (!aiChatPanel) return;

        console.info('Portfolio AI: closing chat widget.');
        aiChatPanel.classList.remove('is-open');
        aiChatPanel.style.display = 'none';
        aiChatPanel.setAttribute('aria-hidden', 'true');
        aiChatToggle?.setAttribute('aria-expanded', 'false');
    }

    function appendAiMessage(text, type, extraClass = '') {
        const message = document.createElement('div');
        message.className = `ai-message ai-message-${type} ${extraClass}`.trim();
        message.textContent = text;
        aiChatMessages.appendChild(message);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        return message;
    }

    async function sendPortfolioChatMessage(messageText) {
        const message = String(messageText || '').trim();
        if (!message || !aiChatMessages) return;

        appendAiMessage(message, 'user');
        const loadingMessage = appendAiMessage('Thinking...', 'bot', 'ai-message-loading');
        if (aiChatInput) aiChatInput.value = '';

        window.setTimeout(() => {
            const query = message.toLowerCase();
            let reply;

            if (query.includes('project') || query.includes('work')) {
                reply = 'Om Prakash has developed the RYDEX Management System, JarWise Expense Tracker, and AgriDev platform. Explore the Projects section to see them.';
            } else if (query.includes('skill') || query.includes('tech') || query.includes('stack') || query.includes('language')) {
                reply = 'Core skills include Next.js, JavaScript, Figma, Kotlin, Jetpack Compose, Spring Boot, MySQL, and UiPath automation.';
            } else if (query.includes('contact') || query.includes('touch') || query.includes('email') || query.includes('hire') || query.includes('reach')) {
                reply = 'You can get in touch through the Contact form at the bottom of this page.';
            } else if (/\b(hi|hello|hey)\b/.test(query)) {
                reply = "Hello! I'm Portfolio AI. How can I help you explore Om Prakash's work?";
            } else {
                reply = `Thanks for asking about "${message}". Try asking about projects, skills, or contact information.`;
            }

            loadingMessage.classList.remove('ai-message-loading');
            loadingMessage.textContent = reply;
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }, 400);
    }

    window.sendPortfolioChatMessage = sendPortfolioChatMessage;

    if (aiChatToggle) {
        aiChatToggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const isVisible = aiChatPanel && (
                aiChatPanel.classList.contains('is-open') ||
                window.getComputedStyle(aiChatPanel).display !== 'none'
            );

            if (isVisible) closeAiChat();
            else openAiChat();
        });
    } else {
        console.warn('Chatbot Warning: #aiChatToggle button not found on page.');
    }

    if (aiChatClose) {
        aiChatClose.addEventListener('click', (event) => {
            event.preventDefault();
            closeAiChat();
        });
    }

    if (aiChatForm) {
        aiChatForm.addEventListener('submit', (event) => {
            event.preventDefault();
            sendPortfolioChatMessage(aiChatInput?.value);
        });
    }

    document.addEventListener('click', (event) => {
        const quickReply = event.target.closest('.ai-quick-reply');
        if (quickReply && quickReply.closest('#aiChatPanel')) {
            sendPortfolioChatMessage(quickReply.textContent);
        }
    });

    // 11. CONTACT FORM HANDLER
    const contactForm = getEl('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!contactForm.checkValidity()) {
                const invalidField = contactForm.querySelector(':invalid');
                alert(invalidField?.type === 'email'
                    ? 'Please enter a valid email address.'
                    : 'Please complete your name, email, and message before sending.');
                invalidField?.focus();
                return;
            }

            const emailConfig = window.PORTFOLIO_EMAILJS;
            const isConfigured = window.emailjs && emailConfig &&
                [emailConfig.publicKey, emailConfig.serviceId, emailConfig.notificationTemplateId, emailConfig.autoReplyTemplateId]
                    .every((value) => value && !value.startsWith('YOUR_'));

            if (!isConfigured) {
                alert('The contact form is not configured yet. Please contact the site owner through another channel.');
                return;
            }

            const templateParams = {
                name: getEl('senderName').value,
                email: getEl('senderEmail').value,
                subject: getEl('senderSubject').value,
                message: getEl('senderMessage').value
            };

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonContent = submitButton?.innerHTML;
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
            }

            try {
                await Promise.all([
                    emailjs.send(emailConfig.serviceId, emailConfig.notificationTemplateId, templateParams),
                    emailjs.send(emailConfig.serviceId, emailConfig.autoReplyTemplateId, templateParams)
                ]);
                alert('Message sent successfully! An auto-reply has been dispatched to your email.');
                contactForm.reset();
            } catch (error) {
                console.error('EmailJS contact form error:', error);
                alert(`Failed to send message: ${error?.text || error?.message || JSON.stringify(error) || 'Please try again.'}`);
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonContent;
                }
            }
        });
    }

    // Unload Object URLs on page unload to free up browser memory
    window.addEventListener('beforeunload', () => {
        createdObjectUrls.forEach(url => URL.revokeObjectURL(url));
    });
});

function logoutAdmin() {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isAdminLoggedIn');
    window.location.href = window.location.pathname;
}