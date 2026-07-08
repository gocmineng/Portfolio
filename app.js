document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const skillCards = document.querySelectorAll('.skill-card');
    const modal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalTag = document.getElementById('modalTag');
    const modalDetails = document.getElementById('modalDetails');
    const modalVideoContainer = document.getElementById('modalVideoContainer');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // Keep track of the last focused element to restore it on modal close
    let lastFocusedElement = null;

    // Helper: extract tweet ID from full X/Twitter URL
    const parseTweetId = (url) => {
        if (url.includes('/status/')) {
            const after = url.split('/status/')[1];
            return after ? after.split('?')[0].split('/')[0] : url;
        }
        return url; // assume it's already a bare ID
    };

    // Open Modal Function
    const openModal = (card) => {
        lastFocusedElement = document.activeElement;

        const title     = card.querySelector('.card-title').textContent;
        const tag       = card.querySelector('.card-tag').textContent;
        const videoType = card.getAttribute('data-video-type');
        const videoId   = card.getAttribute('data-video-id');

        const detailsTemplate = card.querySelector('.card-details-template');
        const detailsHtml     = detailsTemplate ? detailsTemplate.innerHTML : '';

        // Inject text content
        modalTitle.textContent  = title;
        modalTag.textContent    = tag;
        modalDetails.innerHTML  = detailsHtml;

        // Build the player HTML depending on video source type
        if (videoType === 'youtube') {
            modalVideoContainer.classList.remove('video-container--tweet');
            modalVideoContainer.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
                    title="${title}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen>
                </iframe>
            `;

        } else if (videoType === 'custom-url') {
            modalVideoContainer.classList.remove('video-container--tweet');
            modalVideoContainer.innerHTML = `
                <video src="${videoId}" controls autoplay playsinline loop></video>
            `;

        } else if (videoType === 'x' || videoType === 'twitter') {
            // Build the full tweet URL from ID or use as-is
            const tweetUrl = videoId.startsWith('http') ? videoId : `https://x.com/i/status/${videoId}`;
            const tweetId  = parseTweetId(videoId);

            modalVideoContainer.classList.add('video-container--tweet');

            // Inject blockquote then call widgets.load() — the standard, reliable method
            modalVideoContainer.innerHTML = `
                <blockquote class="twitter-tweet" data-media-max-width="560" data-theme="dark" data-dnt="true" data-conversation="none" data-align="center">
                    <a href="https://x.com/i/status/${tweetId}"></a>
                </blockquote>
            `;

            const doLoad = () => {
                window.twttr.widgets.load(modalVideoContainer);

                // Fallback: if no iframe appears after 8s, show error link
                setTimeout(() => {
                    const hasEmbed = modalVideoContainer.querySelector('iframe');
                    if (!hasEmbed) {
                        modalVideoContainer.innerHTML = `
                            <div class="tweet-error">
                                <p>Could not load video.</p>
                                <a href="${tweetUrl}" target="_blank" rel="noopener">Watch on X ↗</a>
                            </div>
                        `;
                    }
                }, 8000);
            };

            if (window.twttr && window.twttr.widgets) {
                doLoad();
            } else {
                const poll = setInterval(() => {
                    if (window.twttr && window.twttr.widgets) {
                        clearInterval(poll);
                        doLoad();
                    }
                }, 200);
                setTimeout(() => clearInterval(poll), 10000);
            }

        } else {
            modalVideoContainer.classList.remove('video-container--tweet');
            modalVideoContainer.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.95rem;">
                    No video configured yet.
                </div>
            `;
        }

        // Show modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        modalCloseBtn.focus();
    };

    // Close Modal Function
    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');

        // Remove tweet class and clear content (stops any media instantly)
        modalVideoContainer.classList.remove('video-container--tweet');
        modalVideoContainer.innerHTML = '';

        if (lastFocusedElement) lastFocusedElement.focus();
    };

    // Attach click & keyboard listeners to all skill cards
    skillCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('click', () => openModal(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(card);
            }
        });
    });

    // Close via button, backdrop click, or Escape key
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
});
