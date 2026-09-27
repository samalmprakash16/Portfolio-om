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
    const isAdminMode = () => document.body.classList.contains('is-admin') ||
        localStorage.getItem('isAdmin') === 'true' ||
        localStorage.getItem('isAdminLoggedIn') === 'true';

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
        localStorage.removeItem('userResumeUrl_type');
    }

    function syncResumeButton() {
        const storedResumeUrl = localStorage.getItem('userResumeUrl');
        const savedResumeUrl = storedResumeUrl || 'assets/docs/resume.pdf';
        const savedResumeType = storedResumeUrl
            ? localStorage.getItem('userResumeUrl_type') ||
                (savedResumeUrl.toLowerCase().includes('.pdf') ? 'application/pdf' : '')
            : 'application/pdf';
        const resumeButton = getEl('heroResumeBtn');
        const resumePreviewButton = getEl('openResumeModal');
        const resumeDownloadButton = getEl('resumeDownloadBtn');
        const contactResumeLink = getEl('contactResumeLink');
        if (resumeButton) resumeButton.setAttribute('href', savedResumeUrl);
        if (resumePreviewButton) {
            resumePreviewButton.setAttribute('data-doc', savedResumeUrl);
            resumePreviewButton.setAttribute('data-doc-type', savedResumeType);
            resumePreviewButton.disabled = savedResumeType !== 'application/pdf' &&
                !savedResumeType.startsWith('image/');
        }
        if (resumeDownloadButton) resumeDownloadButton.setAttribute('href', savedResumeUrl);
        if (contactResumeLink) contactResumeLink.setAttribute('href', savedResumeUrl);
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

    const statsContainer = document.querySelector('.stats-container');
    const statCounters = statsContainer ? statsContainer.querySelectorAll('.counter') : [];
    const setCounterValue = (counter, value) => {
        const decimals = Number.parseInt(counter.dataset.decimals || '0', 10);
        counter.textContent = value.toFixed(decimals);
    };
    const showCounterTargets = () => {
        statCounters.forEach((counter) => {
            const target = Number.parseFloat(counter.dataset.target || '');
            if (Number.isFinite(target)) setCounterValue(counter, target);
        });
    };

    if (statsContainer && statCounters.length) {
        if (reducedMotionQuery.matches || !('IntersectionObserver' in window)) {
            showCounterTargets();
        } else {
            const statsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    statCounters.forEach((counter) => {
                        const target = Number.parseFloat(counter.dataset.target || '');
                        if (!Number.isFinite(target)) return;

                        const duration = 2000;
                        const startTime = performance.now();
                        const animate = (currentTime) => {
                            const progress = Math.min((currentTime - startTime) / duration, 1);
                            const easedProgress = 1 - Math.pow(1 - progress, 3);
                            setCounterValue(counter, target * easedProgress);

                            if (progress < 1) {
                                window.requestAnimationFrame(animate);
                            } else {
                                setCounterValue(counter, target);
                            }
                        };

                        window.requestAnimationFrame(animate);
                    });

                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.3 });

            statsObserver.observe(statsContainer);
        }
    }

    // Cross-fade hero roles in a fixed title row to prevent layout shifts.
    const typingText = getEl('typingText');
    const typingRoles = ['Visual Developer', 'Frontend Specialist', 'Android Creator'];
    let typingRoleIndex = 0;

    if (typingText && !reducedMotionQuery.matches) {
        const typewriterTimer = window.setInterval(() => {
            typingText.classList.add('is-fading');
            window.setTimeout(() => {
                typingRoleIndex = (typingRoleIndex + 1) % typingRoles.length;
                typingText.textContent = typingRoles[typingRoleIndex];
                typingText.classList.remove('is-fading');
            }, 350);
        }, 3500);

        window.addEventListener('beforeunload', () => window.clearInterval(typewriterTimer), { once: true });
    }

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

    function openDocumentPreview(docSrc, docTitle, docType = '', fileName = '') {
        if (!docSrc) return;

        if (modalTitle) modalTitle.textContent = docTitle;

        const isPdf = docType === 'application/pdf' ||
            docSrc.toLowerCase().includes('.pdf') ||
            fileName.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            if (modalImg) { modalImg.style.display = 'none'; modalImg.src = ''; }
            if (modalFrame) { modalFrame.src = docSrc; modalFrame.style.display = 'block'; }
        } else {
            if (modalFrame) { modalFrame.style.display = 'none'; modalFrame.src = ''; }
            if (modalImg) { modalImg.src = docSrc; modalImg.style.display = 'block'; }
        }

        if (docModal) docModal.style.display = 'flex';
    }

    function bindModalTrigger(button) {
        if (!button) return;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const docSrc = button.getAttribute('data-doc');
            const docTitle = button.getAttribute('data-title') || 'Document View';
            const docType = button.getAttribute('data-doc-type') || '';
            const fileName = docTitle;
            openDocumentPreview(docSrc, docTitle, docType, fileName);
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

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && docModal?.style.display === 'flex') {
            closeDocumentModal();
        }
    });

    // 4. CERTIFICATE STATUS AND PERSISTENT FILE STORAGE
    const courseCertifications = [
        { id: 'excel-uipath', title: 'Excel Automation with the Modern Experience in Studio (v2024.10)', provider: 'UiPath', issueDate: 'Issued Apr 2026', logo: 'uipath.png' },
        { id: 'prompt-ibm', title: 'Mastering in Prompt', provider: 'IBM', issueDate: 'Issued Apr 2026', logo: 'ibm.png' },
        { id: 'controlflow-uipath', title: 'Control Flow in Studio (v2024.10)', provider: 'UiPath', issueDate: 'Issued Apr 2026', logo: 'uipath.png' },
        { id: 'py-structures-coursera', title: 'Python Data Structures', provider: 'Coursera', issueDate: 'Issued Jul 2025', logo: 'coursera.png' },
        { id: 'py-everybody-coursera', title: 'Programming for Everybody (Getting Started with Python)', provider: 'Coursera', issueDate: 'Issued Jul 2025', logo: 'coursera.png' }
    ];
    const certificateMetadataKey = 'uploaded_certificates';
    const customCoursesKey = 'dynamic_custom_courses';
    const certificateDatabaseName = 'portfolio-certificate-files';
    const allowedCourseLogos = new Set(['uipath.png', 'ibm.png', 'coursera.png', 'favicon.png']);
    const defaultCourseLogo = 'favicon.png';

    function isAllowedCourseLogo(logo) {
        if (allowedCourseLogos.has(logo)) return true;
        try {
            const logoUrl = new URL(logo);
            if (logoUrl.protocol !== 'https:' || logoUrl.hash) return false;
            if (logoUrl.hostname === 'logo.clearbit.com') {
                return /^\/[a-z0-9.-]+$/i.test(logoUrl.pathname) && !logoUrl.search;
            }
            if (logoUrl.hostname === 'www.google.com' && logoUrl.pathname === '/s2/favicons') {
                const domain = logoUrl.searchParams.get('domain');
                return Boolean(domain && /^[a-z0-9.-]+$/i.test(domain) &&
                    logoUrl.searchParams.get('sz') === '128' &&
                    [...logoUrl.searchParams.keys()].every(key => key === 'domain' || key === 'sz'));
            }
            return false;
        } catch {
            return false;
        }
    }

    function getStoredCustomCourses() {
        const serialized = localStorage.getItem(customCoursesKey);
        if (!serialized) return [];

        try {
            const courses = JSON.parse(serialized);
            if (!Array.isArray(courses)) throw new Error('Custom course data must be a list.');
            return courses.filter(course =>
                course &&
                typeof course.id === 'string' &&
                /^custom-[a-z0-9-]{1,100}$/i.test(course.id) &&
                course.id.startsWith('custom-') &&
                typeof course.title === 'string' &&
                typeof course.provider === 'string' &&
                typeof course.issueDate === 'string' &&
                isAllowedCourseLogo(course.logo)
            );
        } catch (error) {
            console.error('Unable to read saved custom courses:', error);
            setUploadFeedback('Saved custom courses could not be read. Check browser storage before adding another course.', 'error');
            return [];
        }
    }

    const builtInCourseCertifications = [...courseCertifications];
    const storedCustomCourses = getStoredCustomCourses();
    courseCertifications.push(...storedCustomCourses);
    const courseCertificationIds = new Set(courseCertifications.map(course => course.id));

    function setUploadFeedback(message, state = '') {
        const feedback = getEl('uploadFeedback');
        if (!feedback) return;
        feedback.textContent = message;
        feedback.classList.toggle('is-error', state === 'error');
        feedback.classList.toggle('is-success', state === 'success');
    }

    function getStoredCertificates() {
        const serialized = localStorage.getItem(certificateMetadataKey);
        if (!serialized) return {};

        try {
            const certificates = JSON.parse(serialized);
            if (!certificates || typeof certificates !== 'object' || Array.isArray(certificates)) {
                throw new Error('Certificate status data has an invalid format.');
            }
            return certificates;
        } catch (error) {
            console.error('Unable to read saved certificate statuses:', error);
            setUploadFeedback('Saved certificate statuses could not be read. Re-upload certificates to restore them.', 'error');
            return {};
        }
    }

    function renderUploadStatuses() {
        const certificates = getStoredCertificates();
        courseCertifications.forEach(({ id }) => {
            const statusContainer = getEl(`status-${id}`);
            if (!statusContainer) return;
            statusContainer.replaceChildren();

            const certificate = certificates[id];
            if (!certificate || certificate.status !== 'Uploaded Successful') return;

            const badge = document.createElement('span');
            badge.className = 'status-badge uploaded';
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-circle-check';
            icon.setAttribute('aria-hidden', 'true');
            badge.append(icon, document.createTextNode(' Uploaded Successful'));
            statusContainer.append(badge);
        });
    }

    function bindCertificateView(button, course) {
        button.addEventListener('click', async () => {
            const certificates = getStoredCertificates();
            const certificate = certificates[course.id];
            if (!certificate || certificate.status !== 'Uploaded Successful') {
                alert('Certificate document has not been uploaded yet.');
                return;
            }

            try {
                const savedFile = await readCertificateFile(course.id);
                if (!savedFile?.blob) {
                    throw new Error('The saved certificate file is missing. Please upload it again.');
                }
                const fileUrl = createSafeObjectURL(savedFile.blob);
                openDocumentPreview(fileUrl, course.title, savedFile.fileType, savedFile.fileName);
            } catch (error) {
                console.error(`Unable to open certificate "${course.id}":`, error);
                alert(error instanceof Error ? error.message : 'Could not open this certificate. Please try again.');
            }
        });
    }

    function renderCustomCourse(course) {
        const grid = document.querySelector('.courses-grid');
        if (!grid || Array.from(grid.querySelectorAll('.course-card'))
            .some(card => card.dataset.courseId === course.id)) return;

        const card = document.createElement('article');
        card.className = 'course-card';
        card.dataset.courseId = course.id;

        const header = document.createElement('div');
        header.className = 'course-card-header';

        const logo = document.createElement('img');
        logo.className = 'provider-logo';
        logo.src = course.logo;
        logo.alt = `${course.provider} logo`;
        logo.loading = 'lazy';
        logo.dataset.logoDomain = course.logo.startsWith('https://logo.clearbit.com/')
            ? course.logo.split('/').pop()
            : '';
        logo.addEventListener('error', () => {
            const domain = logo.dataset.logoDomain;
            if (domain) {
                logo.dataset.logoDomain = '';
                logo.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
                return;
            }
            logo.src = defaultCourseLogo;
        });

        const status = document.createElement('span');
        status.className = 'upload-status';
        status.id = `status-${course.id}`;
        status.setAttribute('aria-live', 'polite');

        const headerActions = document.createElement('div');
        headerActions.className = 'card-header-actions';
        headerActions.append(status);
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn-delete-course custom-course-delete';
        deleteButton.title = 'Delete custom course';
        deleteButton.setAttribute('aria-label', `Delete ${course.title}`);
        deleteButton.hidden = !isAdminMode();
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fa-solid fa-trash-can';
        deleteIcon.setAttribute('aria-hidden', 'true');
        deleteButton.append(deleteIcon);
        deleteButton.addEventListener('click', () => deleteCustomCourse(course.id));
        headerActions.append(deleteButton);
        header.append(logo, headerActions);

        const body = document.createElement('div');
        body.className = 'course-body';
        const providerTag = document.createElement('span');
        providerTag.className = 'provider-tag';
        providerTag.textContent = `${course.provider} Certified`;

        const title = document.createElement('h3');
        title.className = 'course-title';
        title.textContent = course.title;

        const issueDate = document.createElement('p');
        issueDate.className = 'issue-date';
        const dateIcon = document.createElement('i');
        dateIcon.className = 'fa-regular fa-calendar';
        dateIcon.setAttribute('aria-hidden', 'true');
        issueDate.append(dateIcon, document.createTextNode(` ${course.issueDate}`));

        const viewButton = document.createElement('button');
        viewButton.type = 'button';
        viewButton.className = 'btn-view-cert';
        viewButton.dataset.courseId = course.id;
        viewButton.append('View ');
        const expandIcon = document.createElement('i');
        expandIcon.className = 'fa-solid fa-expand';
        expandIcon.setAttribute('aria-hidden', 'true');
        viewButton.append(expandIcon);
        bindCertificateView(viewButton, course);

        body.append(providerTag, title, issueDate, viewButton);
        card.append(header, body);
        grid.append(card);
        renderUploadStatuses();
    }

    storedCustomCourses.forEach(renderCustomCourse);

    function syncCustomCourseAdminControls() {
        const showDelete = isAdminMode();
        getAll('.custom-course-delete').forEach(button => {
            button.hidden = !showDelete;
        });
    }

    function syncCustomCourses() {
        const customCourses = getStoredCustomCourses();
        const customCourseIds = new Set(customCourses.map(course => course.id));

        getAll('.course-card[data-course-id^="custom-"]').forEach(card => {
            if (!customCourseIds.has(card.dataset.courseId)) card.remove();
        });

        courseCertifications.splice(0, courseCertifications.length, ...builtInCourseCertifications, ...customCourses);
        courseCertificationIds.clear();
        courseCertifications.forEach(course => courseCertificationIds.add(course.id));
        customCourses.forEach(renderCustomCourse);
        renderUploadStatuses();
        syncCustomCourseAdminControls();
    }

    const adminCourseObserver = new MutationObserver(syncCustomCourseAdminControls);
    adminCourseObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    function openCertificateDatabase() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('This browser does not support persistent certificate storage.'));
                return;
            }

            const request = window.indexedDB.open(certificateDatabaseName, 1);
            request.onupgradeneeded = () => {
                const database = request.result;
                if (!database.objectStoreNames.contains('certificates')) {
                    database.createObjectStore('certificates');
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Could not open certificate storage.'));
            request.onblocked = () => reject(new Error('Certificate storage is blocked by another open page.'));
        });
    }

    async function storeCertificateFile(courseId, file) {
        const database = await openCertificateDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction('certificates', 'readwrite');
            transaction.objectStore('certificates').put({
                blob: file,
                fileName: file.name,
                fileType: file.type
            }, courseId);
            transaction.oncomplete = () => {
                database.close();
                resolve();
            };
            transaction.onerror = () => {
                database.close();
                reject(transaction.error || new Error('Could not save the certificate file.'));
            };
            transaction.onabort = () => {
                database.close();
                reject(transaction.error || new Error('Certificate file storage was interrupted.'));
            };
        });
    }

    async function readCertificateFile(courseId) {
        const database = await openCertificateDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction('certificates', 'readonly');
            const request = transaction.objectStore('certificates').get(courseId);
            let certificateFile;
            request.onsuccess = () => { certificateFile = request.result; };
            transaction.oncomplete = () => {
                database.close();
                resolve(certificateFile);
            };
            transaction.onerror = () => {
                database.close();
                reject(transaction.error || new Error('Could not read the certificate file.'));
            };
            transaction.onabort = () => {
                database.close();
                reject(transaction.error || new Error('Certificate file reading was interrupted.'));
            };
        });
    }

    async function deleteCertificateFile(courseId) {
        const database = await openCertificateDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction('certificates', 'readwrite');
            transaction.objectStore('certificates').delete(courseId);
            transaction.oncomplete = () => {
                database.close();
                resolve();
            };
            transaction.onerror = () => {
                database.close();
                reject(transaction.error || new Error('Could not delete the certificate file.'));
            };
            transaction.onabort = () => {
                database.close();
                reject(transaction.error || new Error('Certificate deletion was interrupted.'));
            };
        });
    }

    async function deleteCustomCourse(courseId) {
        if (!isAdminMode()) {
            alert('Only the site administrator can delete a custom course.');
            return;
        }
        if (!/^custom-[a-z0-9-]{1,100}$/i.test(courseId)) {
            alert('This custom course has an invalid identifier and cannot be deleted.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this course certification?')) return;

        try {
            await deleteCertificateFile(courseId);
            const certificates = getStoredCertificates();
            delete certificates[courseId];
            localStorage.setItem(certificateMetadataKey, JSON.stringify(certificates));
            const customCourses = getStoredCustomCourses().filter(course => course.id !== courseId);
            localStorage.setItem(customCoursesKey, JSON.stringify(customCourses));
            syncCustomCourses();
            setUploadFeedback('Custom course deleted.', 'success');
        } catch (error) {
            console.error(`Unable to delete custom course "${courseId}":`, error);
            alert(error instanceof Error ? `Could not delete course: ${error.message}` : 'Could not delete this course.');
        }
    }

    renderUploadStatuses();
    window.addEventListener('storage', (event) => {
        if (event.key === certificateMetadataKey) renderUploadStatuses();
        if (event.key === customCoursesKey) syncCustomCourses();
    });

    getAll('.btn-view-cert').forEach(button => {
        const course = courseCertifications.find(item => item.id === button.getAttribute('data-course-id'));
        if (course) bindCertificateView(button, course);
    });

    // 5. FILE UPLOAD CATEGORY UI SELECTOR
    const docCategorySelect = getEl('docCategorySelect');
    const customCourseFields = getEl('customCourseFields');
    const newCourseTitleInput = getEl('newCourseTitle');
    const newProviderInput = getEl('newProvider');
    const newIssueDateInput = getEl('newIssueDate');
    const logoSearchInput = getEl('logoSearchInput');
    const logoPreviewImg = getEl('logoPreviewImg');
    let currentResolvedLogoUrl = defaultCourseLogo;

    function toggleCustomCourseFields(value) {
        const isCustomCourse = value === 'new-course';
        if (customCourseFields) customCourseFields.hidden = !isCustomCourse;
        [newCourseTitleInput, newProviderInput, newIssueDateInput].forEach(input => {
            if (input) input.required = isCustomCourse;
        });
    }

    if (docCategorySelect) {
        docCategorySelect.addEventListener('change', () => {
            toggleCustomCourseFields(docCategorySelect.value);
            if (fileInput) {
                fileInput.accept = courseCertificationIds.has(docCategorySelect.value) || docCategorySelect.value === 'new-course'
                    ? '.pdf,.png,.jpg,.jpeg'
                    : '.pdf,.png,.jpg,.jpeg,.doc,.docx';
            }
            selectedFile = null;
            if (fileInput) fileInput.value = '';
            if (fileDetails) fileDetails.style.display = 'none';
            if (uploadSubmitBtn) uploadSubmitBtn.disabled = true;
            setUploadFeedback('');
        });
    }
    toggleCustomCourseFields(docCategorySelect?.value || '');

    function searchAndPreviewLogo(query) {
        const cleanQuery = query.trim().toLowerCase();
        currentResolvedLogoUrl = defaultCourseLogo;

        if (!cleanQuery) {
            if (logoPreviewImg) {
                logoPreviewImg.dataset.logoRequestUrl = '';
                logoPreviewImg.dataset.logoFallbackUrl = '';
                logoPreviewImg.src = defaultCourseLogo;
            }
            return;
        }

        let domain = cleanQuery;
        if (/^https?:\/\//i.test(domain)) {
            try {
                domain = new URL(domain).hostname;
            } catch {
                domain = '';
            }
        }
        domain = domain.replace(/^www\./, '').replace(/\s+/g, '');
        if (!domain.includes('.')) domain += '.com';
        if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain)) {
            if (logoPreviewImg) {
                logoPreviewImg.dataset.logoRequestUrl = '';
                logoPreviewImg.dataset.logoFallbackUrl = '';
                logoPreviewImg.src = defaultCourseLogo;
            }
            return;
        }

        const logoUrl = `https://logo.clearbit.com/${encodeURIComponent(domain)}`;
        currentResolvedLogoUrl = logoUrl;
        if (logoPreviewImg) {
            logoPreviewImg.dataset.logoRequestUrl = logoUrl;
            logoPreviewImg.dataset.logoFallbackUrl =
                `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
            logoPreviewImg.src = logoUrl;
        }
    }

    if (logoSearchInput) {
        logoSearchInput.addEventListener('input', () => searchAndPreviewLogo(logoSearchInput.value));
    }

    if (logoPreviewImg) {
        logoPreviewImg.addEventListener('error', () => {
            const failedUrl = logoPreviewImg.dataset.logoRequestUrl;
            if (!failedUrl || logoPreviewImg.src !== failedUrl) return;
            const fallbackUrl = logoPreviewImg.dataset.logoFallbackUrl;
            if (fallbackUrl && failedUrl !== fallbackUrl) {
                currentResolvedLogoUrl = fallbackUrl;
                logoPreviewImg.dataset.logoRequestUrl = fallbackUrl;
                logoPreviewImg.dataset.logoFallbackUrl = '';
                logoPreviewImg.src = fallbackUrl;
                return;
            }
            currentResolvedLogoUrl = defaultCourseLogo;
            logoPreviewImg.dataset.logoRequestUrl = '';
            logoPreviewImg.dataset.logoFallbackUrl = '';
            logoPreviewImg.src = defaultCourseLogo;
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

    let selectedFile = null;
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

        const category = docCategorySelect?.value || '';
        if (!category) {
            alert('Select a course or document type before choosing a file.');
            if (fileInput) fileInput.value = '';
            return;
        }

        const isCourseCertificate = courseCertificationIds.has(category) || category === 'new-course';
        const certificateFileExtension = /\.(pdf|png|jpe?g)$/i.test(file.name);
        if (isCourseCertificate && !certificateFileExtension) {
            alert('Course certificates must be PDF, PNG, or JPG files.');
            if (fileInput) fileInput.value = '';
            return;
        }

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
        uploadSubmitBtn.addEventListener('click', async () => {
            if (denyPublicUpload()) return;
            if (!selectedFile) return;

            const category = docCategorySelect?.value || '';
            if (!category) {
                setUploadFeedback('Select a course or document type before uploading.', 'error');
                return;
            }

            let fileUrl = '';
            let customCourse = null;
            if (category === 'new-course') {
                const title = newCourseTitleInput?.value.trim() || '';
                const provider = newProviderInput?.value.trim() || '';
                const issueDate = newIssueDateInput?.value.trim() || '';
                const logo = currentResolvedLogoUrl;

                if (!title || !provider || !issueDate) {
                    setUploadFeedback('Enter a course title, provider, and issue date.', 'error');
                    return;
                }
                if (!isAllowedCourseLogo(logo)) {
                    setUploadFeedback('Enter a valid brand name or domain for the provider logo.', 'error');
                    return;
                }

                const uniqueSuffix = window.crypto?.randomUUID
                    ? window.crypto.randomUUID()
                    : Math.random().toString(36).slice(2);
                const courseId = `custom-${Date.now()}-${uniqueSuffix}`;
                customCourse = { id: courseId, title, provider, issueDate, logo };
            }

            if (courseCertificationIds.has(category) || customCourse) {
                const course = customCourse || courseCertifications.find(item => item.id === category);
                if (!course || !/\.(pdf|png|jpe?g)$/i.test(selectedFile.name)) {
                    setUploadFeedback('Choose a PDF, PNG, or JPG file for the selected course.', 'error');
                    return;
                }

                uploadSubmitBtn.disabled = true;
                setUploadFeedback('Saving certificate...');
                try {
                    const courseId = course.id;
                    await storeCertificateFile(courseId, selectedFile);
                    if (customCourse) {
                        const customCourses = getStoredCustomCourses();
                        customCourses.push(customCourse);
                        localStorage.setItem(customCoursesKey, JSON.stringify(customCourses));
                        courseCertifications.push(customCourse);
                        courseCertificationIds.add(courseId);
                    }
                    const certificates = getStoredCertificates();
                    certificates[courseId] = {
                        fileName: selectedFile.name,
                        fileType: selectedFile.type,
                        uploadedAt: new Date().toLocaleDateString(),
                        status: 'Uploaded Successful'
                    };
                    localStorage.setItem(certificateMetadataKey, JSON.stringify(certificates));
                    if (customCourse) renderCustomCourse(customCourse);
                    renderUploadStatuses();
                    setUploadFeedback(`${course.title} uploaded successfully.`, 'success');
                    if (customCourse) {
                        if (docCategorySelect) docCategorySelect.value = '';
                        toggleCustomCourseFields('');
                        if (newCourseTitleInput) newCourseTitleInput.value = '';
                        if (newProviderInput) newProviderInput.value = '';
                        if (newIssueDateInput) newIssueDateInput.value = '';
                        if (logoSearchInput) logoSearchInput.value = '';
                        searchAndPreviewLogo('');
                    }
                    if (fileInput) fileInput.value = '';
                    selectedFile = null;
                    if (fileDetails) fileDetails.style.display = 'none';
                    uploadSubmitBtn.disabled = true;
                    return;
                } catch (error) {
                    console.error(`Unable to save certificate "${category}":`, error);
                    setUploadFeedback(
                        `Certificate upload failed: ${error instanceof Error ? error.message : 'Unknown storage error.'}`,
                        'error'
                    );
                    uploadSubmitBtn.disabled = false;
                    return;
                }
            } else if (category === 'resume') {
                fileUrl = createSafeObjectURL(selectedFile);
                localStorage.setItem('userResumeUrl', fileUrl);
                localStorage.setItem('userResumeUrl_type', selectedFile.type);
                syncResumeButton();
            } else {
                setUploadFeedback('Select one of the listed courses or the resume option.', 'error');
                return;
            }

            const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB';

            if (category === 'resume' && attachedDocsGrid) {
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
                setUploadFeedback('Resume updated successfully.', 'success');
            }

            if (fileInput) fileInput.value = '';
            selectedFile = null;
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
                const techTags = project.techStack
                    .map((technology) => `<span class="project-tech-tag">${escapeHtml(technology)}</span>`)
                    .join('');
                const repoLink = githubUrl
                    ? `<a href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer" class="repo-name"><i class="fa-brands fa-github" aria-hidden="true"></i> ${escapeHtml(repoName)}</a>`
                    : `<span class="repo-name">${escapeHtml(repoName)}</span>`;

                return `
                    <article class="compact-card${githubUrl ? ' project-card-link' : ''}" ${githubUrl ? `role="link" tabindex="0" data-repo-url="${escapeHtml(githubUrl)}" aria-label="Open ${escapeHtml(repoName)} on GitHub" aria-keyshortcuts="Enter Space"` : ''}>
                        <div class="compact-card-main">
                            <div class="repo-header">
                                ${repoLink}
                                <span class="repo-badge">${githubUrl ? 'Public' : 'Project'}</span>
                            </div>
                            <p class="repo-desc">${escapeHtml(project.description)}</p>
                            <div class="project-tech-tags">${techTags}</div>
                        </div>
                        <div class="repo-meta">
                            <span><span class="repo-lang-dot" style="background-color: ${languageColor}"></span>${escapeHtml(language)}</span>
                            <span><i class="fa-regular fa-star" aria-hidden="true"></i> ${project.stars}</span>
                            <span><i class="fa-solid fa-code-fork" aria-hidden="true"></i> ${project.forks}</span>
                            <span class="repo-index">#${globalIndex}</span>
                            ${demoUrl ? `<a class="repo-demo-link" href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener noreferrer">Live Preview <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : ''}
                            ${githubUrl
                                ? `<a class="icon-btn repo-github-btn" href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer" title="Open GitHub Repository" aria-label="Open ${escapeHtml(repoName)} on GitHub"><i class="fa-brands fa-github" aria-hidden="true"></i></a>`
                                : `<button type="button" class="icon-btn repo-github-btn is-unavailable" title="Add a GitHub URL to enable this button" aria-label="GitHub repository URL not configured" disabled><i class="fa-brands fa-github" aria-hidden="true"></i></button>`}
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
        projectSlider.addEventListener('click', (event) => {
            if (event.target.closest('a.repo-github-btn')) event.stopPropagation();
        }, true);

        projectSlider.addEventListener('click', (e) => {
            const cardLink = e.target.closest('.compact-card[data-repo-url]');
            if (cardLink && !e.target.closest('a, button')) {
                window.open(cardLink.dataset.repoUrl, '_blank', 'noopener,noreferrer');
                return;
            }

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

        projectSlider.addEventListener('keydown', (event) => {
            const card = event.target.closest('.compact-card[data-repo-url]');
            if (!card || event.target !== card || !['Enter', ' '].includes(event.key)) return;
            event.preventDefault();
            window.open(card.dataset.repoUrl, '_blank', 'noopener,noreferrer');
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

            const cleanUrl = githubUrlInput.value.trim();
            if (!cleanUrl) {
                alert('Please paste a valid GitHub Repository URL.');
                return;
            }

            let parsedGithubUrl;
            try {
                parsedGithubUrl = new URL(cleanUrl);
            } catch {
                alert('Invalid GitHub URL format. Example: https://github.com/username/repository');
                return;
            }

            const pathParts = parsedGithubUrl.pathname.split('/').filter(Boolean);
            if (parsedGithubUrl.hostname !== 'github.com' || pathParts.length < 2) {
                alert('Invalid GitHub URL format. Example: https://github.com/username/repository');
                return;
            }

            const owner = pathParts[0];
            const repo = pathParts[1].replace(/\.git$/, '');
            if (!owner || !repo) {
                alert('Invalid GitHub URL format. Example: https://github.com/username/repository');
                return;
            }

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
                    githubUrl: cleanUrl,
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
    const aiRobotSpeech = getEl('aiRobotSpeech');
    let robotThankYouTimer;

    function resetOmexConversation() {
        if (!aiChatMessages) return;

        aiChatMessages.querySelectorAll('.ai-chat-row').forEach((row, index) => {
            if (index > 0) row.remove();
        });
        if (aiChatInput) aiChatInput.value = '';
        if (aiChatPanel) {
            aiChatPanel.classList.remove('is-open');
            aiChatPanel.style.display = 'none';
            aiChatPanel.setAttribute('aria-hidden', 'true');
        }
        aiChatToggle?.setAttribute('aria-expanded', 'false');
        aiChatToggle?.setAttribute('aria-label', 'Open AI assistant');
        aiChatToggle?.classList.remove('is-chat-open', 'is-thanking');
    }

    resetOmexConversation();
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) resetOmexConversation();
    });

    function normalizeOmexQuery(text) {
        return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    }

    function editDistance(first, second) {
        const distances = Array.from({ length: first.length + 1 }, (_, index) => [index]);
        for (let column = 0; column <= second.length; column += 1) {
            distances[0][column] = column;
        }

        for (let row = 1; row <= first.length; row += 1) {
            for (let column = 1; column <= second.length; column += 1) {
                const substitutionCost = first[row - 1] === second[column - 1] ? 0 : 1;
                distances[row][column] = Math.min(
                    distances[row - 1][column] + 1,
                    distances[row][column - 1] + 1,
                    distances[row - 1][column - 1] + substitutionCost
                );
            }
        }

        return distances[first.length][second.length];
    }

    function matchesOmexTopic(query, terms) {
        const words = query.split(' ');
        return terms.some((term) => {
            if (term.includes(' ') ? query.includes(term) : words.includes(term)) return true;
            if (/^\d/.test(term)) return false;
            return words.some((word) => word.length >= 4 && !/^\d/.test(word) && editDistance(word, term) <= 1);
        });
    }

    function getOmexTimeGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 22) return 'Good evening';
        return 'Hello, night owl';
    }

    function appendLocalTimestamp(messageElement) {
        const now = new Date();
        const time = document.createElement('time');
        time.className = 'ai-chat-timestamp';
        time.dateTime = now.toISOString();
        time.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageElement.appendChild(time);
    }

    aiChatMessages?.querySelectorAll('.ai-message-bot').forEach((message) => appendLocalTimestamp(message));

    function getOmexResponse(userText) {
        const query = normalizeOmexQuery(userText);

        if (/\b(who are you|your name|what is your name)\b/.test(query) ||
            matchesOmexTopic(query, ['identity'])) {
            return "I'm Omex, your friendly portfolio assistant. I can answer questions about Om Prakash's education, skills, projects, and contact details.";
        }

        if (matchesOmexTopic(query, ['interview', 'hire', 'hiring', 'meet', 'schedule', 'call', 'contact', 'talk', 'touch', 'reach', 'email'])) {
            return 'To contact Om Prakash about an interview or opportunity, use the Contact section at the bottom of the page.';
        }

        if (matchesOmexTopic(query, ['school', 'college', 'university', 'study', 'studying', 'education', 'academic', 'grade', 'degree', 'bca', 'christ', 'claret', 'tapovan', '10th', '12th', 'percentage', 'marks', 'score', 'result'])) {
            if (matchesOmexTopic(query, ['10th', 'secondary', 'claret', 'nagpur'])) {
                return 'Om Prakash completed 10th Grade at St. Claret School in Butibori, Nagpur, in 2022 with a score of 62%.';
            }
            if (matchesOmexTopic(query, ['12th', 'commerce', 'tapovan', 'mehsana', 'gujarat'])) {
                return 'Om Prakash completed 12th Grade (Commerce) at Tapovan International School in Mehsana, Gujarat, in 2024 with a score of 71%.';
            }
            if (matchesOmexTopic(query, ['percentage', 'marks', 'score', 'result'])) {
                return 'Om Prakash scored 62% in 10th Grade at St. Claret School and 71% in 12th Grade (Commerce) at Tapovan International School. He is pursuing a BCA at CHRIST University.';
            }
            return 'Om Prakash is a third-year BCA student at CHRIST University, Lavasa, Pune, with a passing year of 2027. He completed 12th Grade (Commerce) at Tapovan International School (71%) and 10th Grade at St. Claret School (62%).';
        }

        if (matchesOmexTopic(query, ['experience', 'intern', 'internship', 'work', 'mady', 'dnnovate'])) {
            return 'Om Prakash has completed two internships: Data Scraping & Data Analyst Intern at Mady Solutions in Ghaziabad (May–August 2026), and UI/UX Intern at Dnnovate Pvt Ltd in Nagpur (June–August 2025). At Mady Solutions, he structured business data and analyzed it with Excel Pivot Tables. At Dnnovate, he designed a website and UI wireframes in Figma.';
        }

        if (matchesOmexTopic(query, ['skill', 'skills', 'technology', 'tech', 'stack', 'language', 'java', 'python', 'kotlin', 'react', 'uipath'])) {
            return 'Om Prakash works with Next.js, Kotlin, Jetpack Compose, MySQL, UiPath, Figma, JavaScript, Python, Streamlit, and Pandas.';
        }

        if (matchesOmexTopic(query, ['project', 'projects', 'app', 'website', 'rydex', 'jarwise', 'agridev'])) {
            return 'Featured projects include RYDEX Management System, JarWise Expense Tracker, and the AgriDev Ecosystem. You can explore them in the Projects section.';
        }

        if (matchesOmexTopic(query, ['hi', 'hello', 'hey', 'greetings', 'morning', 'evening', 'night'])) {
            return `${getOmexTimeGreeting()}! I'm Omex. How can I help you explore Om Prakash's work or background today?`;
        }

        return "I'm Omex! I can help with Om Prakash's education and scores, internships, projects, skills, or how to get in touch.";
    }

    function openAiChat() {
        if (!aiChatPanel) {
            console.error('Chatbot Error: #aiChatPanel element not found in DOM.');
            return;
        }

        console.info('Omex: opening assistant.');
        aiChatPanel.classList.add('is-open');
        aiChatPanel.style.display = 'flex';
        aiChatPanel.setAttribute('aria-hidden', 'false');
        aiChatToggle?.setAttribute('aria-expanded', 'true');
        aiChatToggle?.setAttribute('aria-label', 'Close AI assistant');
        aiChatToggle?.classList.add('is-chat-open');
        aiChatToggle?.classList.remove('is-thanking');
        if (robotThankYouTimer) window.clearTimeout(robotThankYouTimer);
        window.setTimeout(() => aiChatInput?.focus(), 100);
    }

    function closeAiChat() {
        if (!aiChatPanel) return;

        console.info('Omex: closing assistant.');
        aiChatPanel.classList.remove('is-open');
        aiChatPanel.style.display = 'none';
        aiChatPanel.setAttribute('aria-hidden', 'true');
        aiChatToggle?.setAttribute('aria-expanded', 'false');
        aiChatToggle?.setAttribute('aria-label', 'Open AI assistant');
        aiChatToggle?.classList.remove('is-chat-open');
        aiChatToggle?.classList.add('is-thanking');
        if (aiRobotSpeech) aiRobotSpeech.textContent = 'Thank you! 💖';
        if (robotThankYouTimer) window.clearTimeout(robotThankYouTimer);
        robotThankYouTimer = window.setTimeout(() => {
            if (aiRobotSpeech) aiRobotSpeech.textContent = 'Use Me! ✨';
            aiChatToggle?.classList.remove('is-thanking');
        }, 3000);
    }

    function appendAiMessage(text, type, extraClass = '') {
        const message = document.createElement('div');
        message.className = `ai-message ai-message-${type} ${extraClass}`.trim();
        message.textContent = text;
        const row = document.createElement('div');
        row.className = `ai-chat-row ai-chat-row-${type}`;

        if (type === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'ai-bot-avatar';
            avatar.setAttribute('aria-hidden', 'true');
            avatar.innerHTML = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="22" width="60" height="48" rx="12" fill="#1e1b4b" stroke="#818cf8" stroke-width="6"/><circle cx="38" cy="42" r="7" fill="#67e8f9"/><circle cx="62" cy="42" r="7" fill="#67e8f9"/><path d="M 38 54 Q 50 64 62 54" fill="none" stroke="#a5b4fc" stroke-width="5" stroke-linecap="round"/></svg>';
            row.appendChild(avatar);
        }

        if (type === 'bot') appendLocalTimestamp(message);
        row.appendChild(message);
        aiChatMessages.appendChild(row);
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
            const reply = getOmexResponse(message);
            loadingMessage.classList.remove('ai-message-loading');
            loadingMessage.textContent = reply;
            appendLocalTimestamp(loadingMessage);
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
                    : 'Please complete your name, email, subject, and message before sending.');
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