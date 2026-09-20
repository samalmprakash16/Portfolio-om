document.addEventListener('DOMContentLoaded', () => {

    // Helper Utility: Safe query selector wrapper
    const getEl = (id) => document.getElementById(id);
    const getAll = (selector) => document.querySelectorAll(selector);

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
    const slider = getEl('projectSlider');
    const prevBtn = getEl('prevBtn');
    const nextBtn = getEl('nextBtn');

    if (slider && prevBtn && nextBtn) {
        const scrollAmount = 384;

        nextBtn.addEventListener('click', () => {
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
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

    if (dropZone && fileInput) {
        if (browseBtn) browseBtn.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('click', (e) => {
            if (e.target === dropZone || e.target.closest('.drop-zone-content')) {
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
            if (e.dataTransfer.files.length) {
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileSelection(e.target.files[0]);
            }
        });
    }

    function handleFileSelection(file) {
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
            if (!selectedFile) return;

            const category = docCategorySelect ? docCategorySelect.value : 'general';
            const fileUrl = createSafeObjectURL(selectedFile);
            const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB';

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
                alert(`"${selectedFile.name}" attached successfully!`);
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
            id: 'rydex-platform',
            title: 'RYDEX Management System',
            description: 'Full-stack web application with a modern interface, responsive state management, and API connectivity.',
            techStack: ['Next.js', 'CSS Modules', 'REST APIs'],
            liveDemoUrl: '',
            githubUrl: '',
            imageUrl: 'assets/images/project-1.png',
            isFeatured: true
        },
        {
            id: 'jarwise-tracker',
            title: 'JarWise Expense Tracker',
            description: 'Financial tracker featuring clean UI analytics, persistent local database, and customizable budgets.',
            techStack: ['Kotlin', 'Jetpack Compose', 'SQLite'],
            liveDemoUrl: '',
            githubUrl: '',
            imageUrl: 'assets/images/project-2.png',
            isFeatured: true
        },
        {
            id: 'agridev-ecosystem',
            title: 'AgriDev Ecosystem',
            description: 'E-commerce and supply chain monitoring platform optimized for high data throughput and intuitive search.',
            techStack: ['Spring Boot', 'MySQL', 'JavaScript'],
            liveDemoUrl: '',
            githubUrl: '',
            imageUrl: 'assets/images/project-3.png',
            isFeatured: true
        }
    ];
    const storedProjects = JSON.parse(localStorage.getItem(projectStorageKey) || 'null');
    let projects = Array.isArray(storedProjects) && storedProjects.length ? storedProjects : defaultProjects;
    const projectSlider = getEl('projectSlider');
    const projectManagerList = getEl('projectManagerList');
    const githubUrlInput = getEl('githubUrlInput');
    const importGithubBtn = getEl('importGithubBtn');
    const projectModal = getEl('projectModal');
    const projectForm = getEl('projectForm');
    const projectModalTitle = getEl('projectModalTitle');
    const projectTechInput = getEl('projectTechInput');
    const techPreview = getEl('techPreview');

    const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));

    const normalizeProject = (project) => ({
        id: project.id || `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: project.title || 'Untitled Project',
        description: project.description || 'No description provided.',
        techStack: Array.isArray(project.techStack) ? project.techStack : (project.tags || []).filter(Boolean),
        liveDemoUrl: project.liveDemoUrl || '',
        githubUrl: project.githubUrl || project.repoUrl || '',
        imageUrl: project.imageUrl || project.image || '',
        isFeatured: project.isFeatured !== false
    });
    projects = projects.map(normalizeProject);

    function saveAndRenderProjects() {
        localStorage.setItem('user_featured_projects', JSON.stringify(projects));
        renderProjects();
    }

    function renderProjects() {
        if (!projectSlider) return;

        projectSlider.innerHTML = '';
        const featuredProjects = projects.filter((project) => project.isFeatured);
        const hiddenProjects = projects.filter((project) => !project.isFeatured);

        if (featuredProjects.length === 0) {
            projectSlider.innerHTML = `
                <div class="empty-projects-state" style="text-align: center; width: 100%; padding: 40px 20px; color: #8a93a0;">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--primary, #6366f1);"></i>
                    <p style="font-size: 1.05rem; margin: 0; color: #fff;">No featured projects yet.</p>
                    <small>Add a project or enable its featured status to display it here.</small>
                </div>
            `;
        }

        featuredProjects.forEach((proj) => {
            const card = document.createElement('div');
            card.className = 'project-card featured-project';
            card.style.position = 'relative';
            const tags = proj.techStack.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
            const image = escapeHtml(proj.imageUrl || `https://via.placeholder.com/360x200/181c26/ffffff?text=${encodeURIComponent(proj.title)}`);

            card.innerHTML = `
                <div class="project-admin-actions">
                    <span class="featured-status"><i class="fa-solid fa-star"></i> Featured</span>
                    <div class="project-admin-buttons">
                        <button class="icon-btn edit-project-btn" data-id="${escapeHtml(proj.id)}" title="Edit project"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn delete-project-btn" data-id="${escapeHtml(proj.id)}" title="Delete project"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
                <div class="project-img-holder">
                    <img src="${image}" alt="${escapeHtml(proj.title)}" onerror="this.src='https://via.placeholder.com/360x200/181c26/ffffff?text=Project'">
                </div>
                <div class="project-info">
                    <span class="project-category">Featured Project</span>
                    <h3>${escapeHtml(proj.title)}</h3>
                    <p>${escapeHtml(proj.description)}</p>
                    <div class="project-tags">
                        ${tags}
                    </div>
                    <div class="project-card-actions">
                        ${proj.liveDemoUrl ? `<a class="btn btn-primary btn-sm" href="${escapeHtml(proj.liveDemoUrl)}" target="_blank" rel="noopener">Live Demo <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                        ${proj.githubUrl ? `<a class="btn btn-outline btn-sm" href="${escapeHtml(proj.githubUrl)}" target="_blank" rel="noopener">GitHub <i class="fa-brands fa-github"></i></a>` : ''}
                    </div>
                </div>
            `;

            projectSlider.appendChild(card);
        });

        if (projectManagerList) {
            projectManagerList.innerHTML = hiddenProjects.length ? `
                <p class="project-manager-heading">Hidden projects</p>
                ${hiddenProjects.map((project) => `
                    <div class="project-manager-row">
                        <span>${escapeHtml(project.title)}</span>
                        <div class="project-manager-actions">
                            <button class="btn btn-outline btn-sm edit-project-btn" data-id="${escapeHtml(project.id)}">Edit / Feature</button>
                            <button class="icon-btn delete-project-btn" data-id="${escapeHtml(project.id)}" title="Delete project"><i class="fa-solid fa-trash-can"></i></button>
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

    function closeProjectForm() {
        if (projectModal) projectModal.style.display = 'none';
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
        projectModal.style.display = 'flex';
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

    // 11. CONTACT FORM HANDLER
    const contactForm = getEl('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you! Your message has been sent successfully.');
            contactForm.reset();
        });
    }

    // Unload Object URLs on page unload to free up browser memory
    window.addEventListener('beforeunload', () => {
        createdObjectUrls.forEach(url => URL.revokeObjectURL(url));
    });
});