// api-page/script.js
document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const DOM = {
        searchInput: document.getElementById('searchInput'),
        apiList: document.getElementById('apiList'),
        noResults: document.getElementById('noResults'),
    };

    let settings = {};
    let currentlyExpandedCard = null;

    // Initialize
    const init = async () => {
        setupEventListeners();
        await loadSettings();
        setYear();
    };

    // Event Listeners
    const setupEventListeners = () => {
        DOM.searchInput.addEventListener('input', debounce(handleSearch, 300));
        
        // Close expanded card when clicking outside
        document.addEventListener('click', (e) => {
            if (currentlyExpandedCard && !currentlyExpandedCard.contains(e.target)) {
                closeExpandedCard();
            }
        });
    };

    // Load settings from JSON
    const loadSettings = async () => {
        try {
            const response = await fetch('/src/settings.json');
            if (!response.ok) throw new Error(`Failed to load settings: ${response.status}`);
            settings = await response.json();
            populatePageContent();
            renderApiCategories();
        } catch (error) {
            console.error('Error loading settings:', error);
            displayErrorState("Failed to load API configuration.");
        }
    };

    // Populate page content
    const populatePageContent = () => {
        if (!settings || Object.keys(settings).length === 0) return;

        const setContent = (element, value, fallback = '') => {
            if (element) element.textContent = value || fallback;
        };

        setContent(document.getElementById('name'), settings.name, "MikuHost API");
        setContent(document.getElementById('description'), settings.description, "Simple and easy-to-use API documentation.");
        setContent(document.getElementById('version'), settings.version, "v1.0");
        setContent(document.getElementById('creator'), settings.apiSettings?.creator, "𝙍͢𝙮𝙪𝙪𝙍͢𝙚𝙞𝙣𝙯𝙯");
    };

    // Set current year
    const setYear = () => {
        document.getElementById('year').textContent = new Date().getFullYear();
    };

    // Render API categories
    const renderApiCategories = () => {
        if (!DOM.apiList || !settings.categories || !settings.categories.length) {
            displayErrorState("No API categories found.");
            return;
        }

        DOM.apiList.innerHTML = '';

        settings.categories.forEach((category, categoryIndex) => {
            const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
            
            const categoryGroup = document.createElement('div');
            categoryGroup.className = 'category-group';
            categoryGroup.setAttribute('data-category', category.name);

            const categoryHeader = `
                <div class="mb-3">
                    <div class="bg-white border border-gray-300">
                        <button onclick="toggleCategory(${categoryIndex})" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-150">
                            <h2 class="font-bold flex items-center text-base">
                                <span class="material-icons text-lg mr-2 text-gray-700">folder</span>
                                <span class="truncate">${category.name}</span>
                                <span class="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1">${sortedItems.length}</span>
                            </h2>
                            <span class="material-icons text-gray-600 transition-transform duration-150 text-base" id="category-icon-${categoryIndex}">expand_more</span>
                        </button>
                        <div id="category-${categoryIndex}" class="hidden border-t border-gray-200">
                            <div class="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            `;

            let categoryContent = '';
            let endpointIndex = 0;

            sortedItems.forEach((item) => {
                const status = item.status || "ready";
                const isDisabled = status === 'error' || status === 'update';
                
                const statusConfig = {
                    ready: { class: "status-ready", icon: "check_circle", text: "Ready" },
                    error: { class: "status-error", icon: "error", text: "Error" },
                    update: { class: "status-update", icon: "update", text: "Update" }
                };
                
                const currentStatus = statusConfig[status] || statusConfig.ready;

                categoryContent += `
                    <div class="endpoint-card bg-white border border-gray-300 p-3 api-item" 
                         data-method="GET" 
                         data-path="${item.path}" 
                         data-name="${item.name}" 
                         data-category="${category.name}">
                        <div class="flex justify-between items-start mb-2" onclick="toggleEndpoint(${categoryIndex}, ${endpointIndex}, event)">
                            <div class="flex flex-wrap gap-1 flex-1">
                                <span class="method-badge method-get">GET</span>
                                <span class="text-xs ${currentStatus.class} px-2 py-1 rounded flex items-center gap-1">
                                    <span class="material-icons text-xs">${currentStatus.icon}</span>
                                    ${currentStatus.text}
                                </span>
                            </div>
                            <span class="material-icons text-gray-500 transition-transform duration-150 text-base ml-2" id="endpoint-icon-${categoryIndex}-${endpointIndex}">expand_more</span>
                        </div>

                        <div onclick="toggleEndpoint(${categoryIndex}, ${endpointIndex}, event)">
                            <h3 class="font-semibold text-xs font-mono mb-1 truncate" title="${item.path}">${item.path.split('?')[0]}</h3>
                            <p class="text-xs text-gray-600 line-clamp-2">${item.desc}</p>
                        </div>

                        <div id="endpoint-${categoryIndex}-${endpointIndex}" class="hidden mt-3 pt-3 border-t border-gray-200">
                            <div class="text-gray-700 font-bold text-xs mb-2 flex items-center">
                                <span class="material-icons text-sm mr-1">play_arrow</span>
                                TRY IT OUT
                            </div>
                            <form onsubmit="executeRequest(event, ${categoryIndex}, ${endpointIndex}, '${item.path}', '${item.name}')">
                                <div class="mb-3 space-y-2">
                `;

                // Add parameter inputs
                const paramsFromPath = new URLSearchParams(item.path.split('?')[1]);
                const paramKeys = Array.from(paramsFromPath.keys());
                
                if (paramKeys.length > 0) {
                    paramKeys.forEach(paramKey => {
                        const paramValue = paramsFromPath.get(paramKey);
                        const isRequired = paramValue === '' || paramValue === null;
                        
                        categoryContent += `
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">
                                    ${paramKey} ${isRequired ? '<span class="text-red-500">*</span>' : ''}
                                </label>
                                <input type="text" name="${paramKey}" 
                                      class="w-full px-2 py-1 border border-gray-300 text-xs focus:outline-none focus:border-black bg-white placeholder-gray-500 param-input"
                                      placeholder="${paramKey}"
                                      ${isRequired ? 'required' : ''}
                                      value="${paramValue || ''}">
                            </div>
                        `;
                    });
                } else {
                    categoryContent += `
                        <div class="text-xs text-gray-500 italic">
                            No parameters required.
                        </div>
                    `;
                }

                categoryContent += `
                                </div>
                                <div class="flex">
                                    <button type="submit" class="bg-black hover:bg-gray-800 text-white px-3 py-1 text-xs font-medium transition-colors duration-150 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
                                            ${isDisabled ? 'disabled' : ''}>
                                        Execute
                                    </button>
                                    <button type="button" id="clear-${categoryIndex}-${endpointIndex}" onclick="clearResponse(${categoryIndex}, ${endpointIndex})" class="hidden bg-white border border-gray-300 hover:border-black text-gray-900 px-3 py-1 text-xs font-medium transition-colors duration-150 ml-2">
                                        Clear
                                    </button>
                                </div>
                            </form>

                            <div id="response-${categoryIndex}-${endpointIndex}" class="hidden mt-3">
                                <div class="text-gray-700 font-bold text-xs mb-2 flex items-center">
                                    <span class="material-icons text-sm mr-1">code</span>
                                    RESPONSE
                                </div>
                                <div class="bg-gray-900 text-white text-xs p-2 rounded">
                                    <div class="max-h-48 overflow-auto" id="response-content-${categoryIndex}-${endpointIndex}"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                endpointIndex++;
            });

            const categoryFooter = `
                            </div>
                        </div>
                    </div>
                </div>
            `;

            categoryGroup.innerHTML = categoryHeader + categoryContent + categoryFooter;
            DOM.apiList.appendChild(categoryGroup);
        });
    };

    // Display error state
    const displayErrorState = (message) => {
        if (!DOM.apiList) return;
        DOM.apiList.innerHTML = `
            <div class="text-center p-4">
                <span class="material-icons text-red-500 text-3xl mb-2">error</span>
                <p class="text-sm font-medium">${message}</p>
                <p class="text-xs text-gray-500 mt-1">Please try reloading the page or contact administrator.</p>
                <button class="bg-black text-white px-3 py-1 text-xs mt-2 hover:bg-gray-800 transition-colors" onclick="location.reload()">
                    Reload Page
                </button>
            </div>
        `;
    };

    // Search functionality
    const handleSearch = () => {
        const searchTerm = DOM.searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        const categoryGroups = document.querySelectorAll('.category-group');
        categoryGroups.forEach(group => {
            let hasVisibleItems = false;
            let categoryVisibleCount = 0;
            const groupItems = group.querySelectorAll('.api-item');

            groupItems.forEach(item => {
                const path = item.getAttribute('data-path').toLowerCase();
                const name = item.getAttribute('data-name').toLowerCase();
                const category = item.getAttribute('data-category').toLowerCase();

                const searchMatch = path.includes(searchTerm) ||
                                  name.includes(searchTerm) ||
                                  category.includes(searchTerm);

                if (searchMatch) {
                    item.style.display = 'block';
                    hasVisibleItems = true;
                    visibleCount++;
                    categoryVisibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // Update category count
            const categoryCount = group.querySelector('span.bg-gray-100');
            if (categoryCount) {
                categoryCount.textContent = `${categoryVisibleCount}`;
            }

            if (hasVisibleItems) {
                group.style.display = 'block';
            } else {
                group.style.display = 'none';
            }
        });

        if (visibleCount === 0) {
            DOM.noResults.style.display = 'block';
        } else {
            DOM.noResults.style.display = 'none';
        }
    };

    // Close currently expanded card
    const closeExpandedCard = () => {
        if (currentlyExpandedCard) {
            const content = currentlyExpandedCard.querySelector('.hidden[id^="endpoint-"]');
            const icon = currentlyExpandedCard.querySelector('.material-icons[id^="endpoint-icon-"]');
            
            if (content && icon) {
                content.classList.add('slide-up');
                icon.style.transform = 'rotate(0deg)';
                currentlyExpandedCard.classList.remove('api-item-expanded');
                
                setTimeout(() => {
                    content.classList.add('hidden');
                    content.classList.remove('slide-up', 'slide-down');
                }, 150);
            }
            currentlyExpandedCard = null;
        }
    };

    // Utility functions
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Global functions for category and endpoint toggling
    window.toggleCategory = (categoryIndex) => {
        const content = document.getElementById(`category-${categoryIndex}`);
        const icon = document.getElementById(`category-icon-${categoryIndex}`);

        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            content.classList.add('slide-down');
            icon.style.transform = 'rotate(180deg)';
        } else {
            content.classList.add('slide-up');
            icon.style.transform = 'rotate(0deg)';
            setTimeout(() => {
                content.classList.add('hidden');
                content.classList.remove('slide-up', 'slide-down');
            }, 150);
        }
    };

    window.toggleEndpoint = (categoryIndex, endpointIndex, event) => {
        // Prevent event from bubbling to parent elements
        event.stopPropagation();
        
        const content = document.getElementById(`endpoint-${categoryIndex}-${endpointIndex}`);
        const icon = document.getElementById(`endpoint-icon-${categoryIndex}-${endpointIndex}`);
        const card = content.closest('.endpoint-card');

        // If clicking on the same card that's already expanded, close it
        if (currentlyExpandedCard === card) {
            closeExpandedCard();
            return;
        }

        // Close any previously expanded card
        closeExpandedCard();

        // Expand the clicked card
        content.classList.remove('hidden');
        content.classList.add('slide-down');
        icon.style.transform = 'rotate(180deg)';
        card.classList.add('api-item-expanded');
        
        currentlyExpandedCard = card;
    };

    window.clearResponse = (categoryIndex, endpointIndex) => {
        const responseElement = document.getElementById(`response-${categoryIndex}-${endpointIndex}`);
        const responseContent = document.getElementById(`response-content-${categoryIndex}-${endpointIndex}`);
        const clearButton = document.getElementById(`clear-${categoryIndex}-${endpointIndex}`);

        responseElement.classList.add('slide-up');
        setTimeout(() => {
            responseElement.classList.add('hidden');
            responseElement.classList.remove('slide-up', 'slide-down');
            responseContent.innerHTML = '';
            clearButton.classList.add('hidden');
        }, 150);
    };

    window.executeRequest = async (event, categoryIndex, endpointIndex, path, name) => {
        event.preventDefault();
        event.stopPropagation(); // Prevent card from closing

        const form = event.target;
        const responseElement = document.getElementById(`response-${categoryIndex}-${endpointIndex}`);
        const responseContent = document.getElementById(`response-content-${categoryIndex}-${endpointIndex}`);
        const clearButton = document.getElementById(`clear-${categoryIndex}-${endpointIndex}`);
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="loader-small"></span> Loading...';

            // Build URL with parameters
            const formData = new FormData(form);
            const params = new URLSearchParams();
            
            for (let [key, value] of formData.entries()) {
                if (value) {
                    params.append(key, value);
                }
            }

            const fullUrl = `${window.location.origin}${path.split('?')[0]}?${params.toString()}`;

            // Make the request
            const response = await fetch(fullUrl);
            const contentType = response.headers.get("content-type");

            let bodyHtml = "";
            
            // Add request info
            const headerHtml = `<div class="text-gray-400 text-xs mb-2">
                <div>Method: GET</div>
                <div>URL: ${fullUrl}</div>
                <div>Status: ${response.status} ${response.statusText}</div>
            </div>`;

            if (contentType && contentType.includes("application/json")) {
                const responseData = await response.json();
                const jsonString = JSON.stringify(responseData, null, 2);
                bodyHtml = `<pre class="text-white whitespace-pre-wrap">${jsonString}</pre>`;
            } else if (contentType && contentType.startsWith("image/")) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                bodyHtml = `<img src="${imageUrl}" alt="API Image" class="max-w-full rounded border border-gray-700"/>`;
            } else {
                const textData = await response.text();
                bodyHtml = `<pre class="text-white whitespace-pre-wrap">${textData}</pre>`;
            }

            responseContent.innerHTML = headerHtml + bodyHtml;
            responseElement.classList.remove('hidden');
            responseElement.classList.add('slide-down');
            clearButton.classList.remove('hidden');

        } catch (error) {
            responseContent.innerHTML = `
                <div class="text-gray-400 text-xs mb-2">
                    <div>Method: GET</div>
                    <div>URL: ${window.location.origin}${path.split('?')[0]}</div>
                    <div>Status: Error</div>
                </div>
                <div class="text-red-400">Error: ${error.message}</div>
            `;
            responseElement.classList.remove('hidden');
            responseElement.classList.add('slide-down');
            clearButton.classList.remove('hidden');
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    };

    // Initialize the application
    init();
});