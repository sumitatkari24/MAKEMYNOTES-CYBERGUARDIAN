// ========================================
// Configuration
// ========================================
const API_BASE = "http://localhost:8000"; // Backend API endpoint
const MAX_SUBJECTS = 3; // Maximum number of subjects allowed

// ========================================
// Authentication State
// ========================================
let currentUser = null;
let isLoggedIn = false;

// ========================================
// Global State
// ========================================
let subjects = []; // Array of subject names
let uploadedFiles = {}; // Object to track uploaded files per subject
let currentChatSubject = ""; // Currently selected subject for chat
let currentStudySubject = ""; // Currently selected subject for study mode

// ========================================
// DOM Elements
// ========================================
const loginElements = {
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    registerName: document.getElementById('register-name'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    registerConfirmPassword: document.getElementById('register-confirm-password'),
    loginError: document.getElementById('login-error'),
    registerError: document.getElementById('register-error'),
    registerSuccess: document.getElementById('register-success'),
    loginTab: document.getElementById('login-tab'),
    registerTab: document.getElementById('register-tab'),
    rememberMe: document.getElementById('remember-me'),
    agreeTerms: document.getElementById('agree-terms')
};

const elements = {
    // Subject Management
    subjectNameInput: document.getElementById('subject-name'),
    createSubjectBtn: document.getElementById('create-subject-btn'),
    subjectError: document.getElementById('subject-error'),
    subjectList: document.getElementById('subject-list'),
    
    // Upload Section
    uploadSubjectSelect: document.getElementById('upload-subject-select'),
    uploadBox: document.getElementById('upload-box'),
    fileInput: document.getElementById('file-input'),
    uploadError: document.getElementById('upload-error'),
    uploadedFiles: document.getElementById('uploaded-files'),
    
    // Chat Section
    chatSubjectSelect: document.getElementById('chat-subject-select'),
    chatMessages: document.getElementById('chat-messages'),
    questionInput: document.getElementById('question-input'),
    sendQuestionBtn: document.getElementById('send-question-btn'),
    chatError: document.getElementById('chat-error'),
    
    // Study Mode
    studySubjectSelect: document.getElementById('study-subject-select'),
    generateQuestionsBtn: document.getElementById('generate-questions-btn'),
    studyLoading: document.getElementById('study-loading'),
    studyQuestions: document.getElementById('study-questions'),
    studyError: document.getElementById('study-error')
};

// ========================================
// Authentication Functions
// ========================================

/**
 * Switch to login form
 */
function switchToLogin() {
    loginElements.loginForm.style.display = 'block';
    loginElements.registerForm.style.display = 'none';
    loginElements.loginTab.classList.add('active');
    loginElements.registerTab.classList.remove('active');
    clearErrors();
}

/**
 * Switch to register form
 */
function switchToRegister() {
    loginElements.loginForm.style.display = 'none';
    loginElements.registerForm.style.display = 'block';
    loginElements.loginTab.classList.remove('active');
    loginElements.registerTab.classList.add('active');
    clearErrors();
}

/**
 * Toggle password visibility
 * @param {string} inputId - ID of password input
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Clear all error messages
 */
function clearErrors() {
    if (loginElements.loginError) {
        loginElements.loginError.classList.remove('show');
        loginElements.loginError.textContent = '';
    }
    if (loginElements.registerError) {
        loginElements.registerError.classList.remove('show');
        loginElements.registerError.textContent = '';
    }
    if (loginElements.registerSuccess) {
        loginElements.registerSuccess.style.display = 'none';
        loginElements.registerSuccess.textContent = '';
    }
}

/**
 * Show login error
 * @param {string} message - Error message
 */
function showLoginError(message) {
    if (loginElements.loginError) {
        loginElements.loginError.textContent = message;
        loginElements.loginError.classList.add('show');
        setTimeout(() => {
            loginElements.loginError.classList.remove('show');
        }, 5000);
    }
}

/**
 * Show registration error
 * @param {string} message - Error message
 */
function showRegisterError(message) {
    if (loginElements.registerError) {
        loginElements.registerError.textContent = message;
        loginElements.registerError.classList.add('show');
        setTimeout(() => {
            loginElements.registerError.classList.remove('show');
        }, 5000);
    }
}

/**
 * Show registration success
 * @param {string} message - Success message
 */
function showRegisterSuccess(message) {
    if (loginElements.registerSuccess) {
        loginElements.registerSuccess.textContent = message;
        loginElements.registerSuccess.style.display = 'block';
        setTimeout(() => {
            loginElements.registerSuccess.style.display = 'none';
            switchToLogin(); // Switch back to login after successful registration
        }, 3000);
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
    e.preventDefault();
    
    const email = loginElements.loginEmail.value.trim();
    const password = loginElements.loginPassword.value;
    
    // Basic validation
    if (!email || !password) {
        showLoginError('Please fill in all fields');
        return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showLoginError('Please enter a valid email address');
        return;
    }
    
    // Simulate login (in a real app, you'd call your backend API)
    simulateLogin(email, password);
}

/**
 * Handle registration form submission
 * @param {Event} e - Form submit event
 */
function handleRegister(e) {
    e.preventDefault();
    
    const name = loginElements.registerName.value.trim();
    const email = loginElements.registerEmail.value.trim();
    const password = loginElements.registerPassword.value;
    const confirmPassword = loginElements.registerConfirmPassword.value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showRegisterError('Please fill in all fields');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showRegisterError('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showRegisterError('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showRegisterError('Passwords do not match');
        return;
    }
    
    if (!loginElements.agreeTerms.checked) {
        showRegisterError('Please agree to the Terms & Conditions');
        return;
    }
    
    // Simulate registration
    simulateRegistration(name, email, password);
}

/**
 * Simulate login process
 * @param {string} email - User email
 * @param {string} password - User password
 */
function simulateLogin(email, password) {
    // Show loading state
    const loginBtn = loginElements.loginForm.querySelector('button[type="submit"]');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // In a real app, you'd make an API call here
        // For demo purposes, we'll accept any non-empty password
        if (password) {
            // Successful login
            currentUser = {
                email: email,
                name: email.split('@')[0], // Simple name extraction
                id: Date.now()
            };
            isLoggedIn = true;
            
            // Store user data if "Remember me" is checked
            if (loginElements.rememberMe && loginElements.rememberMe.checked) {
                localStorage.setItem('rememberedUser', JSON.stringify({
                    email: email,
                    name: currentUser.name
                }));
            }
            
            // Store session
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Show success and redirect
            showLoginSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                showMainApp();
            }, 1000);
        } else {
            showLoginError('Invalid email or password');
        }
        
        // Reset button
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }, 1500);
}

/**
 * Show login success message
 * @param {string} message - Success message
 */
function showLoginSuccess(message) {
    if (loginElements.loginError) {
        loginElements.loginError.textContent = message;
        loginElements.loginError.classList.add('show', 'success-message');
        loginElements.loginError.classList.remove('error-message');
        setTimeout(() => {
            loginElements.loginError.classList.remove('show', 'success-message');
            loginElements.loginError.classList.add('error-message');
        }, 3000);
    }
}

/**
 * Simulate registration process
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 */
function simulateRegistration(name, email, password) {
    // Show loading state
    const registerBtn = loginElements.registerForm.querySelector('button[type="submit"]');
    const originalText = registerBtn.innerHTML;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    registerBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // In a real app, you'd make an API call here
        // For demo purposes, we'll accept any valid input
        
        // Successful registration
        showRegisterSuccess('Account created successfully! Redirecting to login...');
        
        // Reset form
        loginElements.registerForm.reset();
        
        // Reset button
        registerBtn.innerHTML = originalText;
        registerBtn.disabled = false;
    }, 2000);
}

/**
 * Login as guest
 */
function loginAsGuest() {
    currentUser = {
        email: 'guest@example.com',
        name: 'Guest User',
        id: 'guest'
    };
    isLoggedIn = true;
    
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showMainApp();
}

/**
 * Show forgot password dialog
 */
function showForgotPassword() {
    alert('Forgot password functionality would be implemented here.\nIn a real application, this would send a password reset link to your email.');
}

/**
 * Show terms and conditions
 */
function showTerms() {
    alert('Terms and Conditions would be displayed here.\nIn a real application, this would show your full terms of service.');
}

/**
 * Logout user
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session data
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('rememberedUser');
        
        // Reset state
        currentUser = null;
        isLoggedIn = false;
        
        // Show login screen
        showLoginScreen();
    }
}

/**
 * Show main application
 */
function showMainApp() {
    document.querySelector('.login-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    // Update user name in header
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && currentUser) {
        userNameElement.textContent = `Welcome, ${currentUser.name}`;
    }
    
    // Initialize the main app
    initMainApp();
}

/**
 * Show login screen
 */
function showLoginScreen() {
    document.querySelector('.login-container').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    
    // Reset forms
    if (loginElements.loginForm) loginElements.loginForm.reset();
    if (loginElements.registerForm) loginElements.registerForm.reset();
    clearErrors();
    switchToLogin();
}

/**
 * Check if user is already logged in
 */
function checkLoginStatus() {
    // Check session storage
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
        isLoggedIn = true;
        showMainApp();
        return;
    }
    
    // Check local storage for remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const userData = JSON.parse(rememberedUser);
        loginElements.loginEmail.value = userData.email;
        if (loginElements.rememberMe) {
            loginElements.rememberMe.checked = true;
        }
    }
    
    // Show login screen
    showLoginScreen();
}

// ========================================
// Main App Initialization
// ========================================

/**
 * Initialize main application components
 */
function initMainApp() {
    console.log('🚀 Initializing AskMyNotes Main Application...');
    
    // Initialize all components
    initSubjectManagement();
    initFileUpload();
    initChat();
    initStudyMode();
    
    // Check API connection
    checkAPIHealth();
    
    console.log('✅ Main application initialized successfully!');
}

// ========================================
// Utility Functions
// ========================================

/**
 * Show error message in specified element
 * @param {HTMLElement} element - Error message container
 * @param {string} message - Error text to display
 */
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

/**
 * Show success message
 * @param {HTMLElement} element - Message container
 * @param {string} message - Success text to display
 */
function showSuccess(element, message) {
    element.textContent = message;
    element.classList.add('show', 'success-message');
    element.classList.remove('error-message');
    setTimeout(() => {
        element.classList.remove('show', 'success-message');
        element.classList.add('error-message');
    }, 3000);
}

/**
 * Show loading spinner
 * @param {HTMLElement} element - Spinner container
 */
function showLoading(element) {
    element.style.display = 'block';
}

/**
 * Hide loading spinner
 * @param {HTMLElement} element - Spinner container
 */
function hideLoading(element) {
    element.style.display = 'none';
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// ========================================
// Subject Management Functions
// ========================================

/**
 * Initialize subject management functionality
 */
function initSubjectManagement() {
    elements.createSubjectBtn.addEventListener('click', createSubject);
    elements.subjectNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createSubject();
    });
    
    updateSubjectList();
    updateSubjectDropdowns();
}

/**
 * Create a new subject
 */
function createSubject() {
    const subjectName = elements.subjectNameInput.value.trim();
    
    // Validation
    if (!subjectName) {
        showError(elements.subjectError, "Please enter a subject name");
        return;
    }
    
    if (subjects.length >= MAX_SUBJECTS) {
        showError(elements.subjectError, `Maximum ${MAX_SUBJECTS} subjects allowed`);
        return;
    }
    
    if (subjects.includes(subjectName)) {
        showError(elements.subjectError, "Subject already exists");
        return;
    }
    
    // Add subject
    subjects.push(subjectName);
    uploadedFiles[subjectName] = [];
    
    // Clear input and update UI
    elements.subjectNameInput.value = '';
    updateSubjectList();
    updateSubjectDropdowns();
    
    showSuccess(elements.subjectError, `Subject "${subjectName}" created successfully!`);
}

/**
 * Delete a subject
 * @param {string} subjectName - Name of subject to delete
 */
function deleteSubject(subjectName) {
    if (confirm(`Are you sure you want to delete "${subjectName}" and all its files?`)) {
        subjects = subjects.filter(s => s !== subjectName);
        delete uploadedFiles[subjectName];
        
        // Update UI
        updateSubjectList();
        updateSubjectDropdowns();
        
        // Clear selections if deleted subject was selected
        if (currentChatSubject === subjectName) {
            currentChatSubject = "";
            elements.chatSubjectSelect.value = "";
            elements.questionInput.disabled = true;
            elements.sendQuestionBtn.disabled = true;
        }
        
        if (currentStudySubject === subjectName) {
            currentStudySubject = "";
            elements.studySubjectSelect.value = "";
            elements.generateQuestionsBtn.disabled = true;
        }
    }
}

/**
 * Update subject list display
 */
function updateSubjectList() {
    if (subjects.length === 0) {
        elements.subjectList.innerHTML = '<p class="placeholder-text">No subjects created yet. Create up to 3 subjects.</p>';
        return;
    }
    
    elements.subjectList.innerHTML = subjects.map(subject => `
        <div class="subject-item fade-in">
            <div class="subject-name">${subject}</div>
            <button class="delete-btn" onclick="deleteSubject('${subject}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

/**
 * Update all subject dropdowns
 */
function updateSubjectDropdowns() {
    const subjectOptions = subjects.map(subject => 
        `<option value="${subject}">${subject}</option>`
    ).join('');
    
    const defaultOption = '<option value="">-- Select a subject --</option>';
    
    // Update all dropdowns
    elements.uploadSubjectSelect.innerHTML = defaultOption + subjectOptions;
    elements.chatSubjectSelect.innerHTML = defaultOption + subjectOptions;
    elements.studySubjectSelect.innerHTML = defaultOption + subjectOptions;
}

// ========================================
// File Upload Functions
// ========================================

/**
 * Initialize file upload functionality
 */
function initFileUpload() {
    // Drag and drop events
    elements.uploadBox.addEventListener('dragover', handleDragOver);
    elements.uploadBox.addEventListener('dragleave', handleDragLeave);
    elements.uploadBox.addEventListener('drop', handleDrop);
    
    // File input change
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Subject selection change
    elements.uploadSubjectSelect.addEventListener('change', handleUploadSubjectChange);
}

/**
 * Handle drag over event
 * @param {Event} e - Drag event
 */
function handleDragOver(e) {
    e.preventDefault();
    elements.uploadBox.classList.add('drag-over');
}

/**
 * Handle drag leave event
 * @param {Event} e - Drag event
 */
function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadBox.classList.remove('drag-over');
}

/**
 * Handle drop event
 * @param {Event} e - Drop event
 */
function handleDrop(e) {
    e.preventDefault();
    elements.uploadBox.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadFiles(files);
    }
}

/**
 * Handle file selection via input
 * @param {Event} e - Change event
 */
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        uploadFiles(files);
    }
}

/**
 * Handle upload subject selection change
 * @param {Event} e - Change event
 */
function handleUploadSubjectChange(e) {
    const selectedSubject = e.target.value;
    elements.fileInput.disabled = !selectedSubject;
}

/**
 * Upload files to backend
 * @param {FileList} files - Files to upload
 */
function uploadFiles(files) {
    const subjectName = elements.uploadSubjectSelect.value;
    
    if (!subjectName) {
        showError(elements.uploadError, "Please select a subject first");
        return;
    }
    
    // Validate file types
    const validFiles = [];
    for (let file of files) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (extension === 'pdf' || extension === 'txt') {
            validFiles.push(file);
        } else {
            showError(elements.uploadError, `Invalid file type: ${file.name}. Only PDF and TXT files allowed.`);
        }
    }
    
    if (validFiles.length === 0) return;
    
    // Upload each file
    validFiles.forEach(file => {
        uploadSingleFile(file, subjectName);
    });
    
    // Reset file input
    elements.fileInput.value = '';
}

/**
 * Upload a single file
 * @param {File} file - File to upload
 * @param {string} subjectName - Subject name
 */
function uploadSingleFile(file, subjectName) {
    // Add to uploaded files list with uploading status
    const fileId = Date.now() + Math.random();
    const fileItem = {
        id: fileId,
        name: file.name,
        size: file.size,
        status: 'uploading'
    };
    
    uploadedFiles[subjectName].push(fileItem);
    updateFileList(subjectName);
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to backend
    fetch(`${API_BASE}/upload/${encodeURIComponent(subjectName)}`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Update file status to success
        const fileToUpdate = uploadedFiles[subjectName].find(f => f.id === fileId);
        if (fileToUpdate) {
            fileToUpdate.status = 'success';
            updateFileList(subjectName);
            showSuccess(elements.uploadError, `File "${file.name}" uploaded successfully!`);
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        // Update file status to error
        const fileToUpdate = uploadedFiles[subjectName].find(f => f.id === fileId);
        if (fileToUpdate) {
            fileToUpdate.status = 'error';
            updateFileList(subjectName);
        }
        showError(elements.uploadError, `Failed to upload "${file.name}": ${error.message}`);
    });
}

/**
 * Update uploaded files list display
 * @param {string} subjectName - Subject name
 */
function updateFileList(subjectName) {
    if (!uploadedFiles[subjectName] || uploadedFiles[subjectName].length === 0) {
        elements.uploadedFiles.innerHTML = '';
        return;
    }
    
    elements.uploadedFiles.innerHTML = uploadedFiles[subjectName].map(file => {
        const statusClass = file.status === 'error' ? 'error' : '';
        const statusText = file.status === 'uploading' ? 'Uploading...' : 
                          file.status === 'error' ? 'Failed' : 'Uploaded';
        const statusClassNames = `file-status ${file.status}`;
        
        return `
            <div class="file-item ${statusClass} fade-in">
                <div class="file-info">
                    <i class="fas fa-file"></i>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                </div>
                <div>
                    <span class="${statusClassNames}">${statusText}</span>
                    ${file.status === 'error' ? 
                        `<button class="delete-file-btn" onclick="removeFile('${subjectName}', '${file.id}')">
                            <i class="fas fa-times"></i>
                        </button>` : ''
                    }
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Remove a file from the list
 * @param {string} subjectName - Subject name
 * @param {string} fileId - File ID
 */
function removeFile(subjectName, fileId) {
    uploadedFiles[subjectName] = uploadedFiles[subjectName].filter(f => f.id !== fileId);
    updateFileList(subjectName);
}

// ========================================
// Chat Interface Functions
// ========================================

/**
 * Initialize chat functionality
 */
function initChat() {
    elements.chatSubjectSelect.addEventListener('change', handleChatSubjectChange);
    elements.sendQuestionBtn.addEventListener('click', sendQuestion);
    elements.questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendQuestion();
    });
}

/**
 * Handle chat subject selection change
 * @param {Event} e - Change event
 */
function handleChatSubjectChange(e) {
    currentChatSubject = e.target.value;
    elements.questionInput.disabled = !currentChatSubject;
    elements.sendQuestionBtn.disabled = !currentChatSubject;
    
    if (currentChatSubject) {
        elements.questionInput.placeholder = `Ask about ${currentChatSubject}...`;
        elements.questionInput.focus();
    } else {
        elements.questionInput.placeholder = "Ask a question about your notes...";
    }
}

/**
 * Send question to backend
 */
function sendQuestion() {
    const question = elements.questionInput.value.trim();
    
    if (!question) {
        showError(elements.chatError, "Please enter a question");
        return;
    }
    
    if (!currentChatSubject) {
        showError(elements.chatError, "Please select a subject first");
        return;
    }
    
    // Add user message to chat
    addMessageToChat('user', question);
    elements.questionInput.value = '';
    
    // Show loading indicator
    const loadingMsg = addMessageToChat('bot', '<i class="fas fa-spinner fa-spin"></i> Thinking...');
    const loadingMsgElement = loadingMsg.querySelector('.message-content');
    
    // Send to backend
   fetch(`${API_BASE}/ask/${encodeURIComponent(currentChatSubject)}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        question: question
    })
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Remove loading message
        loadingMsg.remove();
        
        // Display response
        displayBotResponse(data);
    })
    .catch(error => {
        console.error('Chat error:', error);
        // Remove loading message
        loadingMsg.remove();
        addMessageToChat('bot', `Sorry, I encountered an error: ${error.message}`);
    });
}

/**
 * Add message to chat display
 * @param {string} sender - 'user' or 'bot'
 * @param {string} content - Message content
 * @returns {HTMLElement} Created message element
 */
function addMessageToChat(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message fade-in`;
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${content}</p>
        </div>
    `;
    
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv;
}

/**
 * Display bot response in structured format
 * @param {Object} response - Response from backend
 */
function displayBotResponse(response) {
    let content = '';
    
    // Check if not found message
    if (response.answer && response.answer.includes('Not found in your notes for')) {
        content = `
            <div class="not-found-message">
                <i class="fas fa-exclamation-circle"></i> ${response.answer}
            </div>
        `;
    } else {
        content = `
            <div class="answer-section">
                <h4><i class="fas fa-lightbulb"></i> Answer:</h4>
                <p>${response.answer || 'No answer provided'}</p>
                
                ${response.citations ? `
                    <div class="citations">
                        <strong>Citations:</strong> ${response.citations}
                    </div>
                ` : ''}
                
                ${response.evidence_snippets ? `
                    <div class="evidence">
                        <strong>Evidence Snippets:</strong>
                        <div>${response.evidence_snippets}</div>
                    </div>
                ` : ''}
                
                ${response.confidence_level ? `
                    <div class="confidence ${response.confidence_level.toLowerCase()}">
                        Confidence: ${response.confidence_level}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    addMessageToChat('bot', content);
}

// ========================================
// Study Mode Functions
// ========================================

/**
 * Initialize study mode functionality
 */
function initStudyMode() {
    elements.studySubjectSelect.addEventListener('change', handleStudySubjectChange);
    elements.generateQuestionsBtn.addEventListener('click', generateStudyQuestions);
}

/**
 * Handle study subject selection change
 * @param {Event} e - Change event
 */
function handleStudySubjectChange(e) {
    currentStudySubject = e.target.value;
    elements.generateQuestionsBtn.disabled = !currentStudySubject;
}

/**
 * Generate study questions
 */
function generateStudyQuestions() {
    if (!currentStudySubject) {
        showError(elements.studyError, "Please select a subject first");
        return;
    }
    
    // Clear previous questions
    elements.studyQuestions.innerHTML = '';
    
    // Show loading
    showLoading(elements.studyLoading);
    elements.generateQuestionsBtn.disabled = true;
    
    // Call backend
    fetch(`${API_BASE}/study-mode`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            subject_name: currentStudySubject
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        hideLoading(elements.studyLoading);
        elements.generateQuestionsBtn.disabled = false;
        displayStudyQuestions(data);
    })
    .catch(error => {
        console.error('Study mode error:', error);
        hideLoading(elements.studyLoading);
        elements.generateQuestionsBtn.disabled = false;
        showError(elements.studyError, `Failed to generate questions: ${error.message}`);
    });
}

/**
 * Display study questions
 * @param {Object} data - Questions data from backend
 */
function displayStudyQuestions(data) {
    let html = '';
    
    // MCQs
    if (data.mcqs && data.mcqs.length > 0) {
        html += `
            <div class="question-section slide-in">
                <h3><i class="fas fa-list-ol"></i> Multiple Choice Questions</h3>
                ${data.mcqs.map((mcq, index) => `
                    <div class="question-item">
                        <h4>Q${index + 1}: ${mcq.question}</h4>
                        <div class="options">
                            ${mcq.options.map((option, optIndex) => `
                                <div onclick="checkAnswer(this, ${optIndex === mcq.correct_answer})">
                                    ${String.fromCharCode(65 + optIndex)}. ${option}
                                </div>
                            `).join('')}
                        </div>
                        ${mcq.explanation ? `<p><strong>Explanation:</strong> ${mcq.explanation}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Short Answer Questions
    if (data.short_answers && data.short_answers.length > 0) {
        html += `
            <div class="question-section slide-in">
                <h3><i class="fas fa-edit"></i> Short Answer Questions</h3>
                ${data.short_answers.map((sa, index) => `
                    <div class="short-answer">
                        <h4>Q${index + 1}: ${sa.question}</h4>
                        <textarea class="answer-box" placeholder="Type your answer here..."></textarea>
                        ${sa.sample_answer ? `<p><strong>Sample Answer:</strong> ${sa.sample_answer}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    elements.studyQuestions.innerHTML = html;
}

/**
 * Check MCQ answer
 * @param {HTMLElement} element - Option element
 * @param {boolean} isCorrect - Whether the answer is correct
 */
function checkAnswer(element, isCorrect) {
    // Remove previous selections
    const parent = element.parentElement;
    parent.querySelectorAll('div').forEach(div => {
        div.classList.remove('correct', 'incorrect');
    });
    
    // Highlight selected answer
    if (isCorrect) {
        element.classList.add('correct');
    } else {
        element.classList.add('incorrect');
    }
}

// ========================================
// API Health Check
// ========================================

/**
 * Check if backend API is available
 */
function checkAPIHealth() {
    fetch(`${API_BASE}/health`, { method: 'GET', timeout: 5000 })
    .then(response => {
        if (response.ok) {
            console.log('✅ Backend API is connected');
        } else {
            console.warn('⚠️ Backend API returned non-OK status');
        }
    })
    .catch(error => {
        console.error('❌ Backend API is not available:', error);
        alert('Warning: Backend API is not connected. Some features may not work.');
    });
}

// ========================================
// Login Form Event Listeners
// ========================================

/**
 * Initialize login form event listeners
 */
function initLoginForm() {
    if (loginElements.loginForm) {
        loginElements.loginForm.addEventListener('submit', handleLogin);
    }
    
    if (loginElements.registerForm) {
        loginElements.registerForm.addEventListener('submit', handleRegister);
    }
}

// ========================================
// Initialization
// ========================================

/**
 * Initialize the application
 */
function init() {
    console.log('🚀 Initializing AskMyNotes Application...');
    
    // Initialize login form
    initLoginForm();
    
    // Check login status
    checkLoginStatus();
    
    console.log('✅ Application initialized successfully!');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);