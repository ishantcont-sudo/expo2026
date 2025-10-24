



    import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

    declare var Panzoom: any;

    document.addEventListener('DOMContentLoaded', () => {

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    // --- Reusable Form Validation Helpers ---
    const showError = (input: HTMLElement, message: string) => {
        const formGroup = input.closest('.form-group, .form-group-consent, .interest-group-container');
        if (!formGroup) return;
        const errorElement = formGroup.querySelector('.error-message') as HTMLElement;
        if (errorElement) {
            errorElement.innerText = message;
            errorElement.style.display = 'block';
        }
        if (input.tagName.toLowerCase() !== 'div') {
            input.classList.add('invalid');
        }
    };

    const clearError = (input: HTMLElement) => {
        const formGroup = input.closest('.form-group, .form-group-consent, .interest-group-container');
         if (!formGroup) return;
        const errorElement = formGroup.querySelector('.error-message') as HTMLElement;
        if (errorElement) {
            errorElement.innerText = '';
            errorElement.style.display = 'none';
        }
         if (input.tagName.toLowerCase() !== 'div') {
            input.classList.remove('invalid');
        }
    };

    // --- Universal Real-Time Validator ---
    const validateField = (field: HTMLElement): boolean => {
        if (!field) return true;
        let isValid = true;
        const input = field as HTMLInputElement;
        const select = field as HTMLSelectElement;
        const checkbox = field as HTMLInputElement;
        const textarea = field as HTMLTextAreaElement;

        const value = input.value?.trim();
        clearError(field);

        switch (field.id) {
            case 'form-name':
            case 'form-booth-name':
            case 'form-student-name':
            case 'form-sponsor-name':
                if (value === '') {
                    showError(field, 'Name is required.');
                    isValid = false;
                }
                break;
            
            case 'form-organization':
            case 'form-booth-company':
            case 'form-student-school':
            case 'form-sponsor-company':
                if (value === '') {
                    const fieldName = (field.id === 'form-booth-company' || field.id === 'form-sponsor-company') ? 'Company' : (field.id === 'form-student-school') ? 'School/Institution' : 'Organization';
                    showError(field, `${fieldName} is required.`);
                    isValid = false;
                }
                break;
                
            case 'form-email':
            case 'form-booth-email':
            case 'form-student-email':
            case 'form-sponsor-email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value === '') {
                    showError(field, 'Email is required.');
                    isValid = false;
                } else if (!emailRegex.test(value)) {
                    showError(field, 'Please enter a valid email address.');
                    isValid = false;
                }
                break;
            
            case 'form-phone':
            case 'form-student-phone':
            case 'form-booth-phone':
            case 'form-sponsor-phone':
                const phoneRegex = /^[\d\s()+-]+$/;
                if ((field.id === 'form-booth-phone' || field.id === 'form-sponsor-phone') && value === '') {
                    showError(field, 'Mobile number is required.');
                    isValid = false;
                } else if (value !== '' && !phoneRegex.test(value)) {
                    showError(field, 'Please enter a valid phone number.');
                    isValid = false;
                }
                break;

            case 'form-booth-title':
            case 'form-sponsor-title':
                 if (value === '') {
                    const fieldName = (field.id === 'form-sponsor-title') ? 'Position' : 'Job Title';
                    showError(field, `${fieldName} is required.`);
                    isValid = false;
                }
                break;
            
            case 'form-booth-website':
            case 'form-sponsor-website':
                const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/i;
                if (value === '') {
                    showError(field, 'Website is required.');
                    isValid = false;
                } else if (!urlRegex.test(value)) {
                    showError(field, 'Please enter a valid website URL.');
                    isValid = false;
                }
                break;

            case 'form-sponsor-message':
                if (textarea.value.trim() === '') {
                    showError(field, 'Message is required.');
                    isValid = false;
                }
                break;
            
            case 'form-interest':
            case 'form-booth-package':
            case 'form-booth-source':
            case 'form-student-nationality':
            case 'form-student-grade':
            case 'form-student-source':
            case 'form-booth-country':
            case 'form-booth-company-field':
            case 'form-sponsor-country':
            case 'form-sponsor-company-field':
                if (select.value === '') {
                    showError(field, 'Please make a selection.');
                    isValid = false;
                }
                break;

            case 'form-student-dob':
                if (input.value === '') {
                     showError(field, 'Date of birth is required.');
                     isValid = false;
                }
                break;
            
            case 'form-booth-consent':
            case 'form-student-consent':
            case 'form-sponsor-consent':
                if (!checkbox.checked) {
                    showError(checkbox, 'You must consent to continue.');
                    isValid = false;
                }
                break;
        }
        return isValid;
    }


    // --- Active Nav Link Highlighting ---
    function highlightActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('#main-nav a.nav-link');

        navLinks.forEach(link => {
            const linkPage = (link as HTMLAnchorElement).href.split('/').pop();

            if (linkPage === currentPage) {
                link.classList.add('active');
                
                // For dropdowns, also highlight the parent
                const parentDropdown = link.closest('.has-dropdown');
                if (parentDropdown) {
                    parentDropdown.querySelector('a.nav-link')?.classList.add('active');
                }
            }
        });
    }


    // --- Mobile Navigation Logic ---
    function initializeMobileNav() {
        const header = document.getElementById('main-header');
        const navToggle = document.querySelector('.nav-toggle') as HTMLButtonElement;
        const mainNav = document.getElementById('main-nav');

        if (!header || !navToggle || !mainNav) return;

        navToggle.addEventListener('click', () => {
        header.classList.toggle('nav-open');
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isExpanded));
        
        if (header.classList.contains('nav-open')) {
            (mainNav.querySelector('a') as HTMLAnchorElement)?.focus();
        } else {
            navToggle.focus();
        }
        });

        // Close menu when a link is clicked, unless it's a dropdown toggle on mobile
        mainNav.addEventListener('click', (e) => {
            const link = (e.target as HTMLElement).closest('a');
            if (!link) return;
            
            // Let the dropdown handler manage clicks on dropdown toggles in mobile view.
            // The dropdown handler now uses stopPropagation, so this logic mainly prevents
            // the nav from closing on mobile if a non-link area in a dropdown li is clicked.
            if (link.parentElement?.classList.contains('has-dropdown') && window.innerWidth <= 768) {
                return; 
            }

            if (header.classList.contains('nav-open')) {
                header.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }
    
    // --- Dropdown Navigation Logic ---
    function initializeDropdowns() {
        const dropdowns = document.querySelectorAll('.has-dropdown');

        dropdowns.forEach((dropdown, index) => {
            const toggle = dropdown.querySelector('a') as HTMLAnchorElement;
            const menu = dropdown.querySelector('.dropdown-menu') as HTMLElement;

            if (!toggle || !menu) return;

            // Setup ARIA attributes
            const menuId = `dropdown-menu-${index}`;
            toggle.setAttribute('aria-haspopup', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            menu.id = menuId;
            toggle.setAttribute('aria-controls', menuId);

            // Click handler for mobile - toggles dropdown
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault(); // Prevent navigation on mobile tap
                    e.stopPropagation(); // Prevent document click listener from firing
                    
                    const isCurrentlyOpen = dropdown.classList.contains('dropdown-open');

                    // Close other open dropdowns
                    document.querySelectorAll('.has-dropdown.dropdown-open').forEach(openDropdown => {
                        if (openDropdown !== dropdown) {
                            openDropdown.classList.remove('dropdown-open');
                            openDropdown.querySelector('a')?.setAttribute('aria-expanded', 'false');
                        }
                    });

                    dropdown.classList.toggle('dropdown-open');
                    toggle.setAttribute('aria-expanded', String(!isCurrentlyOpen));
                }
                // On desktop, the default link behavior is allowed, so no preventDefault.
            });

            // Mouse enter/leave handlers for desktop
            dropdown.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    dropdown.classList.add('dropdown-open');
                    toggle.setAttribute('aria-expanded', 'true');
                }
            });

            dropdown.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768) {
                    dropdown.classList.remove('dropdown-open');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        // This listener closes any open dropdown when a click happens anywhere else on the page.
        // It's primarily for mobile touch interactions outside the menu.
        document.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                document.querySelectorAll('.has-dropdown.dropdown-open').forEach(openDropdown => {
                    openDropdown.classList.remove('dropdown-open');
                    openDropdown.querySelector('a')?.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    // --- Countdown Timer Logic ---
    function initializeMainCountdown() {
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        const countdownContainer = document.getElementById('countdown-timer');

        if (daysEl && hoursEl && minutesEl && secondsEl && countdownContainer) {
            const countdownDate = new Date('2026-04-19T08:00:00').getTime();

            const triggerUpdateAnimation = (element: HTMLElement | null) => {
                if (!element) return;
                const parentUnit = element.closest('.timer-unit');
                if (parentUnit) {
                    parentUnit.classList.add('updated');
                    parentUnit.addEventListener('animationend', () => {
                        parentUnit.classList.remove('updated');
                    }, { once: true });
                }
            };

            const timerInterval = setInterval(() => {
                const now = new Date().getTime();
                const distance = countdownDate - now;

                if (distance < 0) {
                    clearInterval(timerInterval);
                    countdownContainer.innerHTML = '<h4>The event has started!</h4>';
                    return;
                }

                const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
                const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
                
                if (daysEl.textContent !== days) {
                    daysEl.textContent = days;
                    triggerUpdateAnimation(daysEl);
                }
                if (hoursEl.textContent !== hours) {
                    hoursEl.textContent = hours;
                    triggerUpdateAnimation(hoursEl);
                }
                if (minutesEl.textContent !== minutes) {
                    minutesEl.textContent = minutes;
                    triggerUpdateAnimation(minutesEl);
                }
                if (secondsEl.textContent !== seconds) {
                    secondsEl.textContent = seconds;
                    triggerUpdateAnimation(secondsEl);
                }
            }, 1000);
        }
    }
    
    // --- Early Bird Countdown Timer ---
    function initializeEarlyBirdCountdown() {
        const countdownContainer = document.getElementById('early-bird-countdown');
        if (!countdownContainer) return;

        const daysEl = document.getElementById('eb-days');
        const hoursEl = document.getElementById('eb-hours');
        const minutesEl = document.getElementById('eb-minutes');
        const secondsEl = document.getElementById('eb-seconds');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        // The early bird offer ends on the morning of Nov 20, 2025.
        const countdownDate = new Date('2025-11-20T08:00:00').getTime();

        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            if (distance < 0) {
                clearInterval(timerInterval);
                countdownContainer.innerHTML = '<h4>The early bird offer has ended!</h4>';
                return;
            }

            const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
            
            daysEl.textContent = days;
            hoursEl.textContent = hours;
            minutesEl.textContent = minutes;
            secondsEl.textContent = seconds;

        }, 1000);
    }

    // --- Form Submission Logic ---
    const form = document.getElementById('contact-form') as HTMLFormElement;
    const successMessage = document.getElementById('form-success-message');

    if (form && successMessage) {
        const nameInput = document.getElementById('form-name') as HTMLInputElement;
        const orgInput = document.getElementById('form-organization') as HTMLInputElement;
        const emailInput = document.getElementById('form-email') as HTMLInputElement;
        const phoneInput = document.getElementById('form-phone') as HTMLInputElement;
        const interestSelect = document.getElementById('form-interest') as HTMLSelectElement;

        const inputs: HTMLElement[] = [nameInput, orgInput, emailInput, phoneInput, interestSelect];

        inputs.forEach(input => {
            if (!input) return;
            const eventType = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
            input.addEventListener(eventType, () => validateField(input));
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate all fields on submit and check overall validity
            const isFormValid = inputs.map(input => validateField(input)).every(Boolean);

            if (isFormValid) {
                form.style.display = 'none';
                successMessage.style.display = 'block';

                // Trigger sponsorship deck download
                const link = document.createElement('a');
                link.href = '#'; // Placeholder for actual file
                link.download = 'QELE2026-Sponsorship-Deck.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }

     // --- Student Registration Form Logic ---
    function initializeStudentRegistrationForm() {
        const form = document.getElementById('student-registration-form') as HTMLFormElement;
        const successMessage = document.getElementById('student-form-success');
        
        if (!form || !successMessage) return;

        const nameInput = document.getElementById('form-student-name') as HTMLInputElement;
        const emailInput = document.getElementById('form-student-email') as HTMLInputElement;
        const phoneInput = document.getElementById('form-student-phone') as HTMLInputElement;
        const dobInput = document.getElementById('form-student-dob') as HTMLInputElement;
        const nationalitySelect = document.getElementById('form-student-nationality') as HTMLSelectElement;
        const schoolInput = document.getElementById('form-student-school') as HTMLInputElement;
        const gradeSelect = document.getElementById('form-student-grade') as HTMLSelectElement;
        const sourceSelect = document.getElementById('form-student-source') as HTMLSelectElement;
        const consentCheckbox = document.getElementById('form-student-consent') as HTMLInputElement;
        const interestsContainer = document.getElementById('form-student-interests');

        const inputs: HTMLElement[] = [nameInput, emailInput, phoneInput, dobInput, nationalitySelect, schoolInput, gradeSelect, sourceSelect, consentCheckbox];

        const validateInterestCheckboxes = (): boolean => {
            if (!interestsContainer) return true;
            const checkedCheckboxes = interestsContainer.querySelectorAll('input[type="checkbox"]:checked');
            const isValid = checkedCheckboxes.length > 0;
            if (isValid) {
                clearError(interestsContainer);
            } else {
                showError(interestsContainer, 'Please select at least one area of interest.');
            }
            return isValid;
        };

        inputs.forEach(input => {
            if (!input) return;
            const eventType = input.tagName.toLowerCase() === 'select' || ['date', 'checkbox'].includes((input as HTMLInputElement).type) ? 'change' : 'input';
            input.addEventListener(eventType, () => validateField(input));
        });

        interestsContainer?.addEventListener('change', validateInterestCheckboxes);

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const areInputsValid = inputs.map(input => validateField(input)).every(Boolean);
            const areInterestsValid = validateInterestCheckboxes();

            if (areInputsValid && areInterestsValid) {
                form.style.display = 'none';
                successMessage.style.display = 'block';
                window.scrollTo(0, 0); // Scroll to top to see message
            }
        });
    }

    // --- Booth Registration Form Logic ---
    function initializeBoothRegistrationForm() {
        const form = document.getElementById('booth-registration-form') as HTMLFormElement;
        const successMessage = document.getElementById('booth-reg-form-success');

        if (!form || !successMessage) return;

        // Get form fields
        const nameInput = document.getElementById('form-booth-name') as HTMLInputElement;
        const titleInput = document.getElementById('form-booth-title') as HTMLInputElement;
        const companyInput = document.getElementById('form-booth-company') as HTMLInputElement;
        const emailInput = document.getElementById('form-booth-email') as HTMLInputElement;
        const phoneInput = document.getElementById('form-booth-phone') as HTMLInputElement;
        const packageSelect = document.getElementById('form-booth-package') as HTMLSelectElement;
        const sourceSelect = document.getElementById('form-booth-source') as HTMLSelectElement;
        const consentCheckbox = document.getElementById('form-booth-consent') as HTMLInputElement;
        const boothIdInput = document.getElementById('form-booth-id') as HTMLInputElement;
        const countrySelect = document.getElementById('form-booth-country') as HTMLSelectElement;
        const websiteInput = document.getElementById('form-booth-website') as HTMLInputElement;
        const companyFieldSelect = document.getElementById('form-booth-company-field') as HTMLSelectElement;


        const inputs: HTMLElement[] = [nameInput, titleInput, companyInput, emailInput, phoneInput, packageSelect, sourceSelect, consentCheckbox, countrySelect, websiteInput, companyFieldSelect];

        // Pre-fill form from URL parameters
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const pkg = urlParams.get('package');
            const boothId = urlParams.get('boothId');
            
            if (pkg && packageSelect) {
                const option = Array.from(packageSelect.options).find(opt => opt.value.toLowerCase() === pkg.toLowerCase());
                if(option) option.selected = true;
            }
            if (boothId && boothIdInput) {
                boothIdInput.value = boothId;
            }
        } catch (e) {
            console.error("Error processing URL parameters:", e);
        }
        
        // Add real-time validation listeners
        inputs.forEach(input => {
            if (!input) return;
            const eventType = ['select', 'checkbox'].includes(input.tagName.toLowerCase()) || input.getAttribute('type') === 'checkbox' ? 'change' : 'input';
            input.addEventListener(eventType, () => validateField(input));
        });
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const isFormValid = inputs.map(input => validateField(input)).every(Boolean);
            
            if (isFormValid) {
                form.style.display = 'none';
                successMessage.style.display = 'block';
                window.scrollTo(0, 0); // Scroll to top to see message
            }
        });
    }
    
    // --- Sponsorship Registration Form Logic (UPDATED) ---
    function initializeSponsorshipRegistrationForm() {
        const form = document.getElementById('sponsorship-registration-form') as HTMLFormElement;
        const successMessage = document.getElementById('sponsor-form-success');

        if (!form || !successMessage) return;

        // Get form fields
        const nameInput = document.getElementById('form-sponsor-name') as HTMLInputElement;
        const countrySelect = document.getElementById('form-sponsor-country') as HTMLSelectElement;
        const phoneInput = document.getElementById('form-sponsor-phone') as HTMLInputElement;
        const emailInput = document.getElementById('form-sponsor-email') as HTMLInputElement;
        const websiteInput = document.getElementById('form-sponsor-website') as HTMLInputElement;
        const companyInput = document.getElementById('form-sponsor-company') as HTMLInputElement;
        const titleInput = document.getElementById('form-sponsor-title') as HTMLInputElement;
        const companyFieldSelect = document.getElementById('form-sponsor-company-field') as HTMLSelectElement;
        const messageTextarea = document.getElementById('form-sponsor-message') as HTMLTextAreaElement;
        const consentCheckbox = document.getElementById('form-sponsor-consent') as HTMLInputElement;
        
        const inputs: HTMLElement[] = [
            nameInput, countrySelect, phoneInput, emailInput, websiteInput, 
            companyInput, titleInput, companyFieldSelect, messageTextarea, consentCheckbox
        ];

        // Add real-time validation listeners
        inputs.forEach(input => {
            if (!input) return;
            const eventType = ['SELECT', 'TEXTAREA'].includes(input.tagName) || input.getAttribute('type') === 'checkbox' ? 'change' : 'input';
            input.addEventListener(eventType, () => validateField(input));
        });
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const isFormValid = inputs.map(input => validateField(input)).every(Boolean);
            
            if (isFormValid) {
                form.style.display = 'none';
                successMessage.style.display = 'block';
                window.scrollTo(0, 0); // Scroll to top to see message
            }
        });
    }

    // --- AI Chatbot Logic ---
    function initializeChatbot() {
        const fab = document.getElementById('chatbot-fab');
        const windowEl = document.getElementById('chatbot-window');
        const closeBtn = document.getElementById('chatbot-close-btn');
        const clearBtn = document.getElementById('chatbot-clear-btn');
        const form = document.getElementById('chatbot-form') as HTMLFormElement;
        const input = document.getElementById('chatbot-input') as HTMLInputElement;
        const messagesContainer = document.getElementById('chatbot-messages');
        const suggestionsContainer = document.getElementById('chatbot-suggestions');
        const consentCheckbox = document.getElementById('chatbot-consent') as HTMLInputElement;
        const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement;

        if (!fab || !windowEl || !closeBtn || !clearBtn || !form || !input || !messagesContainer || !suggestionsContainer || !consentCheckbox || !submitBtn) return;

        let chat: Chat;
        let hasWelcomed = false;

        const systemInstruction = `You are a lead collection AI Assistant for the QATAR EDUCATION LEADERSHIP EXPO 2026 (QELE 2026). Your primary goal is to identify potential exhibitors or sponsors, collect their contact information, and inform them that their details have been passed to the partnership team. Be friendly, professional, and follow the script below.

        **Conversation Flow:**
        
        1.  **Greeting & Qualification:** Start by greeting the user and asking about their interest.
            *   *Your first message MUST be:* "Hello! I'm the QELE AI Assistant. Are you interested in Exhibiting, Sponsoring, or have another question about the expo?"
        
        2.  **Handle Responses:**
            *   **If user is interested in "Exhibiting" or "Sponsoring":** Immediately transition to lead capture. Say: "That's great to hear! I can have our partnership team send you the detailed Exhibitor & Sponsorship deck with package details and pricing. I just need to collect a few details." Then, proceed to Step 3.
            *   **If user asks a general question (e.g., about dates, location, benefits):** Answer the question concisely using the 'Key Information' below. AFTER answering, you MUST transition to lead capture. For example: "The event is on April 19–20, 2026. **To help you get all the details, I can have our team send you the official brochure. What is your full name?**"
        
        3.  **Lead Capture Sequence:** Ask for the following information ONE AT A TIME. Do not ask for everything at once.
            *   "First, what is your **full name**?"
            *   "Thank you. And what is the name of your **company or institution**?"
            *   "Got it. What is your **job title or position**?"
            *   "Perfect. And what is your **email address** so we can send you the deck?"
            *   (Optional) "Great. Lastly, could I get a **phone number**? This is optional but helps our team connect with you faster."
        
        4.  **Confirmation and Closing:** After collecting the details, confirm them with the user.
            *   "Amazing, thank you! Just to confirm, I have: Name: [User's Name], Company: [User's Company], Email: [User's Email]. Is that correct?"
            *   **If they confirm:** Your final message MUST be: "Excellent. I've automatically sent your details to our partnerships team at **info@eduexpoqatar.com**. They will be in touch with you shortly with the full information deck. Thank you for your interest in QELE 2026!"
            *   **If they correct you:** Apologize and ask for the correct information again. Once corrected, proceed to the final confirmation message.
        
        **Key Information for Answering Questions:**
        - **Event Name:** QATAR EDUCATION LEADERSHIP EXPO 2026 (QELE 2026)
        - **Date:** April 19 – 20, 2026
        - **Location:** Sheraton Grand Doha Resort & Convention Hotel, Qatar.
        - **Organizer:** Student Diwan.
        - **Early Bird Offer:** 15% discount ends November 20, 2025.
        - **Audience:** 4000+ Students, 100+ Universities, 50+ Edutech Companies, K-12 Leaders, Government Reps.
        - **Exhibitor Benefits:** Recruitment, Visibility (1M+ impressions), Thought Leadership, Partnerships.
        
        **Strict Rules:**
        - **DO NOT** provide pricing for packages. Your goal is to get them to request the deck. If asked for price, say: "Pricing details are available in our official sponsorship deck. I can have it sent to you right away if you provide your contact details."
        - **ALWAYS** follow the conversational flow. Your primary objective is lead capture.
        - Be polite and professional. Use markdown for **bolding** key terms.`;

        const renderMarkdown = (text: string) => {
            let html = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                .replace(/\*(.*?)\*/g, '<em>$1</em>');       // Italic

            // Handle lists
            html = html.replace(/^\s*\n\* (.*)/gm, '<ul>\n<li>$1</li>')
                       .replace(/^(<li>.*<\/li>)\s*\n\* (.*)/gm, '$1\n<li>$2</li>')
                       .replace(/<\/li>\n<\/ul>/g, '</li></ul>');
                       
            return html;
        };

        const addMessage = (text: string, sender: 'user' | 'ai') => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', `${sender}-message`);
            messageElement.innerHTML = renderMarkdown(text);
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return messageElement;
        };
        
        const showErrorForConsent = (message: string) => {
            const formGroup = consentCheckbox.closest('.form-group-consent-chatbot');
            const errorElement = formGroup?.querySelector('.error-message') as HTMLElement;
            if (errorElement) {
                errorElement.innerText = message;
                errorElement.style.display = 'block';
            }
        };
        
        const clearErrorForConsent = () => {
            const formGroup = consentCheckbox.closest('.form-group-consent-chatbot');
            const errorElement = formGroup?.querySelector('.error-message') as HTMLElement;
            if (errorElement) {
                errorElement.innerText = '';
                errorElement.style.display = 'none';
            }
        };

        const validateChatForm = () => {
            const message = input.value.trim();
            const consentGiven = consentCheckbox.checked;
            submitBtn.disabled = !message || !consentGiven;
        };
        
        const extractLeadDetailsFromHistory = (messageElements: HTMLElement[]) => {
            const details: { [key: string]: string } = {
                name: '',
                company: '',
                title: '',
                email: '',
                phone: ''
            };

            const questions: { [key: string]: RegExp } = {
                name: /what is your full name/i,
                company: /name of your company or institution/i,
                title: /job title or position/i,
                email: /what is your email address/i,
                phone: /could I get a phone number/i
            };

            messageElements.forEach((msg, index) => {
                const text = msg.textContent || '';
                if (msg.classList.contains('ai-message')) {
                    for (const key in questions) {
                        if (Object.prototype.hasOwnProperty.call(questions, key) && questions[key].test(text)) {
                            const nextMsg = messageElements[index + 1];
                            if (nextMsg && nextMsg.classList.contains('user-message')) {
                                details[key] = nextMsg.textContent?.trim() || '';
                            }
                        }
                    }
                }
            });
            return details;
        };

        const sendUserMessage = async (message: string) => {
            if (!message) return;

            if (!consentCheckbox.checked) {
                showErrorForConsent('Please consent to continue.');
                return;
            }
            clearErrorForConsent();

            addMessage(message, 'user');
            input.value = '';
            validateChatForm();
            submitBtn.disabled = true;
            suggestionsContainer.style.display = 'none';

            let fullResponse = '';
            const aiMessageElement = addMessage('', 'ai');
            aiMessageElement.innerHTML = '<span class="blinking-cursor"></span>';

            try {
                const stream = await chat.sendMessageStream({ message: message });

                for await (const chunk of stream) {
                    fullResponse += chunk.text;
                    aiMessageElement.innerHTML = renderMarkdown(fullResponse) + '<span class="blinking-cursor"></span>';
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
                aiMessageElement.innerHTML = renderMarkdown(fullResponse);

                 // Check if the conversation is a lead submission
                if (fullResponse.includes("I've automatically sent your details")) {
                    const messageElements = Array.from(messagesContainer.querySelectorAll<HTMLElement>('.chat-message'));
                    const leadDetails = extractLeadDetailsFromHistory(messageElements);

                    const subject = "New Lead from QELE 2026 Website Chatbot";
                    const body = `
A new lead has been captured via the website chatbot.

--- Lead Details ---
Name: ${leadDetails.name || 'Not provided'}
Company: ${leadDetails.company || 'Not provided'}
Job Title: ${leadDetails.title || 'Not provided'}
Email: ${leadDetails.email || 'Not provided'}
Phone: ${leadDetails.phone || 'Not provided'}
--------------------

--- Full Chat Transcript ---
${messageElements.map(m => {
    const sender = m.classList.contains('user-message') ? 'User' : 'AI';
    return `${sender}: ${m.textContent}`;
}).join('\n')}
--------------------------
`;
                    const mailtoLink = `mailto:info@eduexpoqatar.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
                    
                    // Open user's default email client
                    window.location.href = mailtoLink;

                    // Log for debugging
                    console.log("--- LEAD CAPTURED & MAILTO TRIGGERED ---");
                    console.log(leadDetails);
                    console.log("-----------------------------------------");
                }


            } catch (error) {
                console.error("Chatbot error:", error);
                 aiMessageElement.innerHTML = "Sorry, I'm having trouble connecting right now. Please try again later.";
            } finally {
                validateChatForm();
                 messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        };

        const createSuggestionChips = () => {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'flex';
            
            const suggestions = ["Exhibiting", "Sponsoring", "Event Dates"];
            suggestions.forEach(suggestionText => {
                const chip = document.createElement('button');
                chip.classList.add('suggestion-chip');
                chip.textContent = suggestionText;
                chip.onclick = () => {
                    sendUserMessage(suggestionText);
                };
                suggestionsContainer.appendChild(chip);
            });
        };

        const startNewChat = async () => {
             chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });

            if (!hasWelcomed) {
                // The AI is instructed to send the first message, but we can send an empty message to trigger it.
                // Or, more simply, just display the first message manually to avoid an unnecessary API call.
                addMessage("Hello! I'm the QELE AI Assistant. Are you interested in Exhibiting, Sponsoring, or have another question about the expo?", 'ai');
                createSuggestionChips();
                hasWelcomed = true;
            }
        }
        
        const openChat = () => {
            windowEl.classList.add('visible');
            if(fab) fab.style.display = 'none';
            if (!chat) {
                startNewChat();
            }
            validateChatForm();
            input.focus();
        };
        
        const closeChat = () => {
            windowEl.classList.remove('visible');
            if(fab) fab.style.display = 'flex';
        };

        const clearChat = () => {
            messagesContainer.innerHTML = '';
            hasWelcomed = false;
            startNewChat();
        };

        input.addEventListener('input', validateChatForm);
        consentCheckbox.addEventListener('change', () => {
            if (consentCheckbox.checked) {
                clearErrorForConsent();
            }
            validateChatForm();
        });

        fab.addEventListener('click', openChat);
        closeBtn.addEventListener('click', closeChat);
        clearBtn.addEventListener('click', clearChat);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            sendUserMessage(input.value.trim());
        });

        validateChatForm();
    }
    
    // --- Proactive Chatbot Engagement ---
    function initializeProactiveChat() {
        const fabContainer = document.getElementById('chatbot-fab-container');
        const bubble = document.getElementById('chatbot-bubble') as HTMLElement;
        const chatbotWindow = document.getElementById('chatbot-window');

        if (!fabContainer || !bubble || !chatbotWindow) return;
        
        let bubbleTimeout: number;

        const showBubble = (message: string) => {
            if (chatbotWindow?.classList.contains('visible') || bubble.style.display === 'block') {
                return;
            }
            bubble.textContent = message;
            bubble.style.display = 'block';

            clearTimeout(bubbleTimeout);
            bubbleTimeout = window.setTimeout(() => {
                hideBubble();
            }, 8000);
        };
        
        const hideBubble = () => {
            bubble.style.display = 'none';
        };
        
        fabContainer.addEventListener('click', () => {
            hideBubble();
            // The main openChat logic is already on the fab itself.
            if(!chatbotWindow.classList.contains('visible')) {
            document.getElementById('chatbot-fab')?.click();
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let message = '';
                    if (entry.target.id === 'booth-packages') {
                        message = 'Questions about packages?';
                    }
                    
                    if (message) {
                        setTimeout(() => showBubble(message), 2000);
                    }
                }
            });
        }, { threshold: 0.6 });

        const sponsorshipSection = document.getElementById('booth-packages');
        if (sponsorshipSection) observer.observe(sponsorshipSection);
    }

    // --- FAQ Accordion ---
    function initializeFaqAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(button => {
            button.addEventListener('click', () => {
                const item = button.closest('.faq-item');
                if (item) {
                    const isOpened = item.classList.toggle('open');
                    button.setAttribute('aria-expanded', String(isOpened));
                }
            });
        });
    }

    // --- Exit Intent Modal ---
    function initializeExitIntentModal() {
        const modal = document.getElementById('exit-intent-modal');
        if (!modal) return;

        const closeModalBtn = modal.querySelector('.modal-close-btn');
        const modalShownInSession = sessionStorage.getItem('exitModalShown') === 'true';

        if (modalShownInSession) {
            return; // Don't set up anything if it's already been shown
        }

        const showModal = () => {
            modal.classList.add('visible');
            sessionStorage.setItem('exitModalShown', 'true');
            // Clean up all triggers once shown
            document.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };

        const hideModal = () => {
            modal.classList.remove('visible');
        };

        const handleMouseOut = (e: MouseEvent) => {
            // Check if mouse is leaving the viewport top
            if (e.clientY <= 0 && e.relatedTarget == null) {
                showModal();
            }
        };

        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent >= 50) {
                showModal();
            }
        };

        const timer = setTimeout(showModal, 10000);

        // Add triggers
        document.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('scroll', handleScroll);

        // Add closing event listeners
        closeModalBtn?.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('visible')) {
                hideModal();
            }
        });
    }
    
    // --- Dynamic Partner Logos for Homepage ---
    function initializeHomePartners() {
        const logoGrid = document.getElementById('home-partners-grid');
        if (!logoGrid) return;

        const partners = [
            { src: 'https://cdn.asp.events/CLIENT_Mark_All_D856883D_926F_07B7_E9D09EE4984A0639/sites/inclusive-education-mena/media/Logos/Ed-logo.png', alt: 'Ministry of Education Logo', customClass: 'moe-logo' },
            { src: 'https://res.cloudinary.com/dj3vhocuf/image/upload/v1761216928/Blue_Bold_Office_Idea_Logo_50_x_50_px_10_l68irx.png', alt: 'Sheraton Grand Doha Logo' },
            { src: 'https://i0.wp.com/blog.10times.com/wp-content/uploads/2019/09/cropped-10times-logo-hd.png?fit=3077%2C937&ssl=1', alt: '10times Logo' },
            { src: 'https://www.eventbrite.com/blog/wp-content/uploads/2025/02/Eventbrite_Hero-Lock-up_Brite-Orange.png', alt: 'Eventbrite Logo', customClass: 'eventbrite-logo' }
        ];
        
        logoGrid.innerHTML = '';

        partners.forEach(partner => {
            const logoItem = document.createElement('div');
            logoItem.className = 'logo-item';
            
            const img = document.createElement('img');
            img.src = partner.src;
            img.alt = partner.alt;

            if (partner.alt === 'Sheraton Grand Doha Logo') {
                img.classList.add('sheraton-logo');
            }
             if (partner.customClass) {
                img.classList.add(partner.customClass);
            }
            
            logoItem.appendChild(img);
            logoGrid.appendChild(logoItem);
        });
    }

    // --- Dynamic Partner Logos for Sponsorship Page ---
    function initializeSponsorPagePartners() {
        const logoGrid = document.getElementById('sponsor-partners-grid');
        if (!logoGrid) return;

        const partners = [
            { src: 'https://logo.clearbit.com/microsoft.com', alt: 'Microsoft Logo' },
            { src: 'https://logo.clearbit.com/google.com', alt: 'Google for Education Logo' },
            { src: 'https://logo.clearbit.com/coursera.org', alt: 'Coursera Logo' },
            { src: 'https://logo.clearbit.com/qf.org.qa', alt: 'Qatar Foundation Logo' },
            { src: 'https://logo.clearbit.com/qu.edu.qa', alt: 'Qatar University Logo' },
            { src: 'https://logo.clearbit.com/britishcouncil.org', alt: 'British Council Logo' },
            { src: 'https://logo.clearbit.com/vodafone.com', alt: 'Vodafone Logo' },
            { src: 'https://logo.clearbit.com/qnb.com', alt: 'QNB Logo' },
        ];
        
        logoGrid.innerHTML = '';

        partners.forEach(partner => {
            const logoItem = document.createElement('div');
            logoItem.className = 'logo-item';
            const img = document.createElement('img');
            img.src = partner.src;
            img.alt = partner.alt;
            logoItem.appendChild(img);
            logoGrid.appendChild(logoItem);
        });
    }


    // --- Agenda Page Tabs ---
    function initializeAgendaTabs() {
        const tabsContainer = document.querySelector('.agenda-tabs');
        if (!tabsContainer) return;

        const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
        const contentPanels = document.querySelectorAll('.agenda-content');

        tabsContainer.addEventListener('click', (e) => {
            const clickedButton = (e.target as HTMLElement).closest('.tab-btn');
            if (!clickedButton) return;

            const tabId = (clickedButton as HTMLElement).dataset.tab;
            
            // Update buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');

            // Update content panels
            contentPanels.forEach(panel => {
                panel.classList.toggle('active', panel.id === tabId);
            });
        });
    }

    // --- Floor Plan Logic ---
    function initializeFloorPlan() {
        if (!document.getElementById('floor-plan-section')) return;

        const boothsData = [
            { id: 'A1', package: 'Platinum', status: 'available' }, { id: 'A2', package: 'Platinum', status: 'sold' },
            { id: 'A3', package: 'Gold', status: 'available' }, { id: 'A4', package: 'Gold', status: 'reserved' },
            { id: 'A5', package: 'Gold', status: 'available' }, { id: 'A6', package: 'Gold', status: 'sold' },
            { id: 'B1', package: 'Silver', status: 'available' }, { id: 'B2', package: 'Silver', status: 'available' },
            { id: 'B3', package: 'Silver', status: 'reserved' }, { id: 'B4', package: 'Silver', status: 'available' },
            { id: 'B5', package: 'Silver', status: 'sold' }, { id: 'B6', package: 'Silver', status: 'available' },
            { id: 'C1', package: 'Basic', status: 'available' }, { id: 'C2', package: 'Basic', status: 'available' },
            { id: 'C3', package: 'Basic', status: 'available' }, { id: 'C4', package: 'Basic', status: 'available' },
            { id: 'C5', package: 'Basic', status: 'sold' }, { id: 'C6', package: 'Basic', status: 'sold' },
        ];

        const map = document.getElementById('floor-plan-map');
        const tooltip = document.getElementById('floor-plan-tooltip');
        const detailsModal = document.getElementById('booth-details-modal');
        const closeModalBtn = detailsModal?.querySelector('.modal-close-btn');

        let activeFilter = 'all';
        
        const packageDetails = {
            'Basic': { size: '3x3 (9 sqm)', benefits: ['Standard-row booth', 'Name on website list', '2 exhibitor passes', 'Access to networking lounge'] },
            'Silver': { size: '4x3 (12 sqm)', benefits: ['Priority row booth', 'Logo on event website', 'Name in event catalogs', '3 exhibitor passes'] },
            'Gold': { size: '6x3 (18 sqm)', benefits: ['Prime hall location', 'Logo + 50-word catalog feature', '4 passes + 1 speaking slot', '10% off add-ons'] },
            'Platinum': { size: '7x3 (21 sqm)', benefits: ['Entrance corner booth', 'Premium furniture & setup', 'Top-tier logo placement', '8 passes + 3 speaking slots', 'Access to VIP lounge'] }
        };

        const renderBooths = () => {
            if (!map) return;
            map.innerHTML = '';
            boothsData.forEach(booth => {
                const boothEl = document.createElement('div');
                boothEl.className = `booth ${booth.status} ${booth.package.toLowerCase()}`;
                boothEl.textContent = booth.id;
                boothEl.dataset.id = booth.id;

                if (activeFilter !== 'all' && booth.package.toLowerCase() !== activeFilter) {
                    boothEl.classList.add('hidden');
                }

                boothEl.addEventListener('mousemove', (e) => showTooltip(e, booth));
                boothEl.addEventListener('mouseleave', hideTooltip);
                boothEl.addEventListener('click', () => {
                    if (booth.status !== 'sold') {
                        showDetailsModal(booth);
                    }
                });

                map.appendChild(boothEl);
            });
        };

        const updateCounts = () => {
            document.getElementById('available-count')!.textContent = boothsData.filter(b => b.status === 'available').length.toString();
            document.getElementById('reserved-count')!.textContent = boothsData.filter(b => b.status === 'reserved').length.toString();
            document.getElementById('sold-count')!.textContent = boothsData.filter(b => b.status === 'sold').length.toString();
        };

        const showTooltip = (e: MouseEvent, booth: any) => {
            if (!tooltip) return;
            tooltip.style.display = 'block';
            tooltip.innerHTML = `
                <strong>Booth ${booth.id}</strong>
                <p>Package: <span>${booth.package}</span></p>
                <p>Status: <span class="status-${booth.status}">${booth.status}</span></p>
            `;
            tooltip.style.left = `${e.pageX + 15}px`;
            tooltip.style.top = `${e.pageY + 15}px`;
        };

        const hideTooltip = () => {
            if (tooltip) tooltip.style.display = 'none';
        };

        const showDetailsModal = (booth: any) => {
            if (!detailsModal) return;
            const details = packageDetails[booth.package as keyof typeof packageDetails];
            
            (detailsModal.querySelector('#details-modal-title') as HTMLElement).textContent = `${booth.package} Booth`;
            (detailsModal.querySelector('#details-modal-booth-id') as HTMLElement).textContent = `ID: ${booth.id}`;
            (detailsModal.querySelector('#details-modal-size') as HTMLElement).textContent = details.size;
            
            const benefitsList = detailsModal.querySelector('#details-modal-benefits') as HTMLElement;
            benefitsList.innerHTML = details.benefits.map(b => `<li><i class="fas fa-check"></i> ${b}</li>`).join('');
            
            const statusEl = detailsModal.querySelector('#details-modal-status') as HTMLElement;
            statusEl.textContent = booth.status;
            statusEl.className = `status-tag ${booth.status}`;

            const enquireBtn = detailsModal.querySelector('#enquire-from-details-btn') as HTMLAnchorElement;
            enquireBtn.href = `booth-registration.html?boothId=${booth.id}&package=${booth.package}`;

            detailsModal.classList.add('visible');
        };

        const hideDetailsModal = () => {
            if (detailsModal) detailsModal.classList.remove('visible');
        };

        closeModalBtn?.addEventListener('click', hideDetailsModal);
        detailsModal?.addEventListener('click', (e) => {
            if (e.target === detailsModal) hideDetailsModal();
        });

        document.querySelectorAll('.fp-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.fp-filter-btn.active')?.classList.remove('active');
                btn.classList.add('active');
                activeFilter = (btn as HTMLElement).dataset.filter || 'all';
                renderBooths();
            });
        });

        renderBooths();
        updateCounts();
    }


    highlightActiveNav();
    initializeMobileNav();
    initializeDropdowns();
    initializeMainCountdown();
    initializeStudentRegistrationForm();
    initializeBoothRegistrationForm();
    initializeSponsorshipRegistrationForm();
    initializeChatbot();
    initializeProactiveChat();
    initializeFaqAccordion();
    initializeExitIntentModal();
    initializeEarlyBirdCountdown();
    initializeHomePartners();
    initializeSponsorPagePartners();
    initializeAgendaTabs();
    initializeFloorPlan();
    });